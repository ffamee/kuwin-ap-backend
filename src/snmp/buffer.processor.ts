import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InfluxService } from 'src/influx/influx.service';

@Processor('write-buffer-queue', { concurrency: 1 })
export class WriteBufferProcessor extends WorkerHost {
  constructor(private readonly influxService: InfluxService) {
    super();
  }

  private async writesBuffer(job: Job) {
    const { measurement, wlcName, data } = job.data as {
      measurement: string;
      wlcName: string;
      data: Record<string, Record<string, unknown>>;
    };
    return await this.influxService.writePoints(
      measurement,
      wlcName,
      new Map(Object.entries(data)),
    );
  }

  private async write(job: Job) {
    const { measurement, key, value } = job.data as {
      measurement: string;
      key: string;
      value: number;
    };
    // console.log(`Writing to InfluxDB: ${measurement} - ${key}: ${value}`);
    return await this.influxService.writePoint(measurement, key, value);
  }

  async process(job: Job) {
    switch (job.name) {
      case 'writes-buffer-job':
        return await this.writesBuffer(job);
      case 'write-buffer-job':
        return await this.write(job);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    console.log(`Buffer ${job.id} is now active.`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Buffer ${job.id} has been completed.`);
    console.dir(job.returnvalue, { depth: null });
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    console.error(`Buffer ${job.id} has failed with error:`, err);
    console.dir(job.data, { depth: null });
  }
}
