import {
  InjectQueue,
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Metrics } from 'src/shared/types/snmp-metrics';
import { StatusState } from 'src/shared/types/define-state';
import { ConfigurationsService } from 'src/configurations/configurations.service';
import { ssidWatchList } from 'src/shared/defined/constants';
@Processor('wlc-polling-queue', { concurrency: 6 })
export class WlcPollingProcessor extends WorkerHost {
  private radioBand: { [key: string]: string };
  constructor(
    private readonly configurationsService: ConfigurationsService,
    @InjectQueue('write-buffer-queue') private readonly writeBufferQueue: Queue,
  ) {
    super();
    this.radioBand = {
      '1': '24',
      '2': '5',
      '3': '6',
    };
  }

  private checkRoff(vendor: string, radio: number) {
    return (
      (vendor === 'cisco' && radio !== 2) ||
      (vendor === 'huawei' && radio !== 1)
    );
  }

  private checkStatus(vendor: string, status: number, temp: StatusState) {
    const ciscoStatus = {
      2: StatusState.Down,
      3: StatusState.Download,
    };
    if (vendor === 'cisco') {
      return status === 1
        ? temp
        : ciscoStatus[status as keyof typeof ciscoStatus];
    } else if (vendor === 'huawei') {
      return status === 8 ? temp : StatusState.Down;
    }
    return temp;
  }

  private async metricsJob(
    job: Job,
    // ): Promise<{ wlcName: string; apNum: number }> {
  ) {
    const { wlcName, wlcHost, wlcVendor } = job.data as {
      wlcName: string;
      wlcHost: string;
      wlcVendor: string;
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
            `Missing keys in radio, band, and client data for ${mac}. with lengths: radio=${
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
          if (this.checkRoff(wlcVendor, radioData as number)) {
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
        let sumRx: bigint = 0n;
        let sumTx: bigint = 0n;
        if (Object.keys(rxValue).length !== Object.keys(txValue).length) {
          console.warn(
            `Missing keys in rx and tx data for ${mac}. with lengths: rx=${Object.keys(rxValue).length}, tx=${Object.keys(txValue).length}`,
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
          // check if rxValue[index] and txValue[index] are numbers
          if (rx.type === 70)
            sumRx += BigInt(
              Buffer.from(rxValue[index] as string, 'hex').readUIntBE(
                0,
                Buffer.from(rxValue[index] as string, 'hex').length,
              ),
            );
          else sumRx += BigInt(rxValue[index] as number);
          if (tx.type === 70)
            sumTx += BigInt(
              Buffer.from(txValue[index] as string, 'hex').readUIntBE(
                0,
                Buffer.from(txValue[index] as string, 'hex').length,
              ),
            );
          else sumTx += BigInt(txValue[index] as number);
        }
        // get id before save
        const ids = await this.configurationsService.snap({
          vendor: wlcVendor,
          mac,
          ...rest,
          ...clientBand,
          ...channelList,
          rx: { value: sumRx, type: rx.type },
          tx: { value: sumTx, type: tx.type },
          wlc: wlcName,
          host: wlcHost,
          ip: ip.value,
          status: this.checkStatus(
            wlcVendor,
            status.value as number,
            statusValue,
          ),
        });
        if (ids) {
          data.set(mac, {
            ...ids,
            ...rest,
            ...clientBand,
            ...channelList,
            rx: { value: sumRx.toString(), type: rx.type },
            tx: { value: sumTx.toString(), type: tx.type },
          });
        } else {
          // remove key 'mac' from data
          data.delete(mac);
        }
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
    await this.writeBufferQueue.add(
      'writes-buffer-job',
      {
        measurement: 'ap_metrics',
        wlcName,
        data: Object.fromEntries(data),
      },
      {
        removeOnComplete: { age: 180, count: 100 },
        removeOnFail: { age: 180, count: 100 },
      },
    );
    await this.writeBufferQueue.add(
      'write-buffer-job',
      { measurement: 'ap_count', key: wlcName, value: data.size },
      {
        removeOnComplete: { age: 180, count: 100 },
        removeOnFail: { age: 180, count: 100 },
      },
    );
    // return { wlcName, apNum: data.size };
  }

  private async ssidCiscoJob(job: Job) {
    // console.dir(await job.getChildrenValues(), { depth: null });
    const { wlcName } = job.data as {
      wlcName: string;
    };
    const childJobs = await job.getChildrenValues();
    const data = new Map<string, Record<string, unknown>>();
    for (const v of Object.values(childJobs)) {
      if (!v) continue;
      const value = v as Record<string, Record<string, unknown>>;
      for (const [index, metrics] of Object.entries(value)) {
        // map key, value of metrics to const
        const key = Object.keys(metrics)[0];
        const value = Object.values(metrics)[0];
        const existing = data.get(key) ?? {};
        existing[index] = value;
        data.set(key, existing);
      }
    }
    try {
      const ssid = data.get('ssid');
      const ssidNum = data.get('ssidNum');
      if (!ssid || !ssidNum) {
        console.warn(`SSID or SSID AP data not found for WLC ${wlcName}`);
        return null;
      }
      if (Object.keys(ssid).length !== Object.keys(ssidNum).length) {
        console.warn(
          `Mismatch in SSID and SSID AP data for WLC ${wlcName}. Skipping.`,
        );
        return null;
      }
      const name: Record<string, Metrics> = {};
      for (const index of Object.keys(ssid)) {
        const ssidData = ssid[index] as Metrics;
        const ssidNumData = ssidNum[index] as Metrics;
        if (!ssidData || !ssidNumData) {
          console.warn(
            `Missing SSID or SSID AP data for WLC ${wlcName} at index ${index}. Skipping.`,
          );
          continue;
        }
        const tmp = Buffer.from(ssidData.value as string, 'utf-8').toString(
          'utf-8',
        );
        name[tmp] = {
          value: ssidNumData.value,
          type: ssidNumData.type,
        };
      }
      // select only name with key 'KUWIN', 'KUWIN-IOT', 'eduroam'
      const filteredName = new Map<string, Record<string, Metrics>>();
      filteredName.set(
        wlcName,
        Object.fromEntries(ssidWatchList.map((ssid) => [ssid, name[ssid]])),
      );
      await this.writeBufferQueue.add(
        'writes-buffer-job',
        {
          measurement: 'ap_ssid',
          wlcName,
          data: Object.fromEntries(filteredName),
        },
        {
          removeOnComplete: { age: 180, count: 100 },
          removeOnFail: { age: 180, count: 100 },
        },
      );
    } catch (error) {
      console.error(`Error processing SSID for WLC ${wlcName}:`, error);
      return null;
    }
  }

  private async ssidHuaweiJob(job: Job) {
    // console.dir(await job.getChildrenValues(), { depth: null });
    const { wlcName } = job.data as {
      wlcName: string;
    };
    const childJobs = await job.getChildrenValues();
    const data = new Map<string, Record<string, unknown>>();
    for (const v of Object.values(childJobs)) {
      if (!v) continue;
      const value = v as Record<string, Record<string, unknown>>;
      for (const [key, metrics] of Object.entries(value)) {
        const name = Object.keys(metrics)[0];
        const value = Object.values(metrics)[0];
        const existing = data.get(key) ?? {};
        existing[name] = value;
        data.set(key, existing);
      }
    }
    try {
      const ssidSum = Object.fromEntries(
        ssidWatchList.map((ssid) => {
          // sum value from all key in data[ssid]
          const d = data.get(ssid) ?? {};
          const sum = Object.values(d as Record<string, Metrics>).reduce(
            (acc, curr) => ({
              value: Number(acc.value) + Number(curr.value),
              type: curr.type,
            }),
            { value: 0, type: 0 },
          );
          return [ssid, sum];
        }),
      );
      const filteredName = new Map<string, Record<string, Metrics>>();
      filteredName.set(
        wlcName,
        Object.fromEntries(ssidWatchList.map((ssid) => [ssid, ssidSum[ssid]])),
      );
      await this.writeBufferQueue.add(
        'writes-buffer-job',
        {
          measurement: 'ap_ssid',
          wlcName,
          data: Object.fromEntries(filteredName),
        },
        {
          removeOnComplete: { age: 180, count: 100 },
          removeOnFail: { age: 180, count: 100 },
        },
      );
    } catch (error) {
      console.error(`Error processing SSID for WLC ${wlcName}:`, error);
      return null;
    }
  }

  async process(job: Job) {
    switch (job.name) {
      case 'metric-polling-job':
        return this.metricsJob(job);
      case 'ssid-cisco-polling-job':
        return this.ssidCiscoJob(job);
      case 'ssid-huawei-polling-job':
        return this.ssidHuaweiJob(job);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
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
