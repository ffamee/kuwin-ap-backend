import {
  Logger,
  Module,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { OidPollingProcessor } from './oid.processor';
import { Queue, Worker } from 'bullmq';
import { ModuleRef } from '@nestjs/core';

@Module({
  providers: [OidPollingProcessor],
  exports: [OidPollingProcessor],
})
export class OidModule implements OnModuleInit, OnApplicationShutdown {
  private workers: Worker[] = [];
  private queues: Queue[] = [];
  private logger = new Logger(OidModule.name, { timestamp: true });

  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    const wlcs = [
      { name: 'wlc-1', host: '172.16.26.10' },
      { name: 'wlc-2', host: '172.16.26.12' },
      { name: 'wlc-3', host: '172.16.26.16' },
    ];
    if (wlcs.length === 0) {
      console.warn(
        '[OidsModule] No WLCs found, no OID polling workers will be created.',
      );
      return;
    }
    for (const wlc of wlcs) {
      const queueName = `oid-polling-queue-${wlc.name}`;
      const processor = this.moduleRef.get(OidPollingProcessor);

      const queue = new Queue(queueName, {
        connection: {
          host: 'localhost',
          port: 6379,
        },
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 10,
        },
      });
      this.queues.push(queue);

      const oidWorker = new Worker(
        queueName,
        async (job) => processor.process(job),
        {
          connection: {
            host: 'localhost',
            port: 6379,
          },
          concurrency: 3,
        },
      );
      this.workers.push(oidWorker);
      oidWorker.on('active', (job) => {
        console.log(
          `Worker started processing job ${job.id} in queue ${queueName}`,
          job.data,
        );
      });
      oidWorker.on('completed', (job, returnvalue) => {
        console.log(
          `Worker completed job ${job.id} in queue ${queueName} with result: ${returnvalue} at ${new Date().toLocaleTimeString()}`,
        );
      });
      oidWorker.on('failed', (job, err) => {
        this.logger.log(
          `Worker failed job ${job?.id} in queue ${queueName} with error: ${err.message}`,
        );
      });
    }
  }

  async onApplicationShutdown(signal?: string) {
    console.log(`OID Module shutting down due to signal: ${signal}`);
    for (const worker of this.workers) {
      await worker.close();
    }
    for (const queue of this.queues) {
      await queue.close();
    }
    console.log('OID Module shutdown complete');
  }
}
