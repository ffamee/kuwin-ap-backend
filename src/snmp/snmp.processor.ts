import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InfluxService } from '../influx/influx.service';
import { AccesspointsService } from '../accesspoints/accesspoints.service';
import { Metrics } from '../shared/types/snmp-metrics';
@Processor('wlc-polling-queue', { concurrency: 5 })
export class WlcPollingProcessor extends WorkerHost {
  constructor(
    private readonly influxService: InfluxService,
    private readonly accesspointsService: AccesspointsService,
  ) {
    super();
  }

  async process(job: Job) {
    // const deps = await job.getDependencies();
    const { wlcName } = job.data as { wlcName: string };
    const childJobs = await job.getChildrenValues();
    const data = new Map<string, Record<string, Metrics>>();
    for (const v of Object.values(childJobs)) {
      const value = v as Record<string, Record<string, Metrics>>;
      for (const [mac, metrics] of Object.entries(value)) {
        const existing =
          data.get(mac) ??
          ((await this.accesspointsService.findIdByRadMac(mac)) as Record<
            string,
            Metrics
          >);
        for (const [name, metric] of Object.entries(metrics)) {
          existing[name] = metric;
        }
        data.set(mac, existing);
      }
    }
    // console.dir({ wlcName, data }, { depth: null, colors: true });
    // Save data to InfluxDB

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
    console.error(`Job ${job.id} failed with error:`, err.message);
  }
}
