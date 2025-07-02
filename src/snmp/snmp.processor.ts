import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('wlc-polling-queue', { concurrency: 5 })
export class WlcPollingProcessor extends WorkerHost {
  constructor() {
    super();
  }

  async process(job: Job) {
    console.log(
      `Processing job ${job.id} in queue ${job.queueName} for 3 seconds...`,
    );
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return true; // Indicate successful processing
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    console.log(`Job ${job.id} is now active.`, job.data);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
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
