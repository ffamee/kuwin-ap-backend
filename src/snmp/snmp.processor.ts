import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InfluxService } from '../influx/influx.service';
import { Metrics } from 'src/shared/types/snmp-metrics';
import { StatusState } from 'src/shared/types/define-state';
import { ConfigurationsService } from 'src/configurations/configurations.service';
@Processor('wlc-polling-queue', { concurrency: 5 })
export class WlcPollingProcessor extends WorkerHost {
  private radioBand: { [key: string]: string };
  private statusSet: { [key: number]: StatusState };
  constructor(
    private readonly influxService: InfluxService,
    private readonly configurationsService: ConfigurationsService,
  ) {
    super();
    this.radioBand = {
      '1': '24',
      '2': '5',
      '3': '6',
    };
    this.statusSet = {
      2: StatusState.Down,
      3: StatusState.Download,
    };
  }

  async process(job: Job) {
    // const deps = await job.getDependencies();
    const { wlcName, wlcHost } = job.data as {
      wlcName: string;
      wlcHost: string;
    };
    const childJobs = await job.getChildrenValues();
    const data = new Map<string, Record<string, unknown>>();
    for (const v of Object.values(childJobs)) {
      if (!v) continue;
      const value = v as Record<string, Record<string, unknown>>;
      for (const [mac, metrics] of Object.entries(value)) {
        // map key, value of metrics to const
        const key = Object.keys(metrics)[0];
        const value = Object.values(metrics)[0];
        const existing = data.get(mac) ?? {};
        existing[key] = value;
        data.set(mac, existing);
      }
    }
    for (const [mac, metrics] of data.entries()) {
      const { radio, band, client, status, channel, rx, tx, ip, ...rest } =
        metrics as Record<string, Metrics>;
      try {
        // if (
        //   radio &&
        //   'value' in radio &&
        //   band &&
        //   'value' in band &&
        //   client &&
        //   'value' in client &&
        //   status &&
        //   'value' in status
        // ) {
        // data is complete
        let statusValue: StatusState = StatusState.Up;
        const radioValue = radio.value as Record<string, unknown>;
        const bandValue = band.value as Record<string, unknown>;
        const clientValue = client.value as Record<string, unknown>;
        const channelValue = channel.value as Record<string, unknown>;
        const rxValue = rx.value as Record<string, unknown>;
        const txValue = tx.value as Record<string, unknown>;
        if (
          Object.keys(radioValue).length !== Object.keys(bandValue).length ||
          Object.keys(radioValue).length !== Object.keys(clientValue).length ||
          Object.keys(radioValue).length !== Object.keys(channelValue).length
        ) {
          console.warn(
            `Mismatch in radio, band, and client data for ${mac}. with lengths: radio=${
              Object.keys(radioValue).length
            }, band=${Object.keys(bandValue).length}, client=${
              Object.keys(clientValue).length
            }, channel=${Object.keys(channelValue).length}`,
          );
          continue;
        }
        const clientBand: { [key: string]: Metrics } = {};
        const channelList: { [key: string]: Metrics } = {};
        for (const index of Object.keys(radioValue)) {
          const radioData = radioValue[index];
          const bandData = bandValue[index];
          const clientData = clientValue[index];
          const channelData = channelValue[index];
          if (
            !(
              index in radioValue &&
              index in bandValue &&
              index in clientValue &&
              index in channelValue
            )
          ) {
            console.warn(
              `Missing data for ${mac} at index ${index}. Skipping this entry. with radio=${(radioData as string) ?? 'N/A'}, band=${(bandData as string) ?? 'N/A'}, client=${(clientData as string) ?? 'N/A'}, channel=${(channelData as string) ?? 'N/A'}`,
            );
            continue;
          }
          if (radioData !== 2) {
            // set status to roff
            statusValue = StatusState.Roff;
            continue;
          }
          // check bandData is valid in this.radioBand
          if (!((bandData as string) in this.radioBand)) {
            console.warn(
              `Invalid band data for ${mac} at index ${index}. Skipping this entry.`,
            );
            continue;
          }
          const t = `client${this.radioBand[bandData as string]}`;
          if (!clientBand[t]) {
            clientBand[t] = {
              value: 0,
              type: client.type,
            };
          }
          (clientBand[t].value as number) += clientData as number;
          const tt = `channel${index === '0' ? '' : '2'}`;
          channelList[tt] = {
            value: channelData,
            type: channel.type,
          };
        }
        // sum rx and tx
        let sumRx = 0;
        let sumTx = 0;
        if (Object.keys(rxValue).length !== Object.keys(txValue).length) {
          console.warn(
            `Mismatch in rx and tx data for ${mac}. with lengths: rx=${Object.keys(rxValue).length}, tx=${Object.keys(txValue).length}`,
          );
          continue;
        }
        for (const index of Object.keys(rxValue)) {
          if (!(index in txValue)) {
            console.warn(
              `Missing tx data for ${mac} at index ${index}. Skipping this entry.`,
            );
            continue;
          }
          sumRx += rxValue[index] as number;
          sumTx += txValue[index] as number;
        }
        // get id before save
        const ids = await this.configurationsService.snap({
          mac,
          ...rest,
          ...clientBand,
          ...channelList,
          rx: { value: sumRx, type: rx.type },
          tx: { value: sumTx, type: tx.type },
          wlc: wlcName,
          host: wlcHost,
          ip: ip.value,
          status:
            status.value === 1
              ? statusValue
              : this.statusSet[status.value as number],
        });
        if (ids) {
          data.set(mac, {
            ...ids,
            ...rest,
            ...clientBand,
            ...channelList,
            rx: { value: sumRx, type: rx.type },
            tx: { value: sumTx, type: tx.type },
          });
        } else {
          // remove key 'mac' from data
          data.delete(mac);
        }
        // }
      } catch (error) {
        console.error(`Error processing metrics for ${mac}:`, error, {
          radio,
          band,
          client,
          channel,
          rx,
          tx,
          status,
          ip,
        });
        data.delete(mac); // remove entry if error occurs
      }
    }
    // console.dir(data, { depth: null });
    console.log(wlcHost, 'has', data.size);
    return await this.influxService.writePoints('ap_metrics', wlcName, data);
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    const { data } = job.data as {
      data: string;
    };
    console.log(`Job ${job.id} is now active.`, job.data);
    console.time(data);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    const { data } = job.data as {
      data: string;
    };
    console.timeEnd(data);
    console.log(
      `Job ${job.id} completed with result:`,
      job.returnvalue,
      'at ',
      new Date().toLocaleTimeString(),
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    const { data } = job.data as {
      data: string;
    };
    console.error(`Job ${job.id} failed with error:`, err.message);
    console.timeEnd(data);
  }
}
