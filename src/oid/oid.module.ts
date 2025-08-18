import {
  Logger,
  Module,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { OidPollingProcessor } from './oid.processor';
import { Queue, Worker } from 'bullmq';
import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { wlcs } from 'src/shared/defined/constants';

@Module({
  providers: [OidPollingProcessor],
  exports: [OidPollingProcessor],
})
export class OidModule implements OnModuleInit, OnApplicationShutdown {
  private workers: Worker[] = [];
  private queues: Queue[] = [];
  private logger = new Logger(OidModule.name, { timestamp: true });

  constructor(
    private moduleRef: ModuleRef,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    // if (wlcs.length !== 4) {
    //   console.warn(
    //     '[OidsModule] No WLCs found, no OID polling workers will be created.',
    //   );
    //   return;
    // }
    for (const wlc of wlcs) {
      const queueName = `oid-polling-queue-${wlc.name}`;
      const processor = this.moduleRef.get(OidPollingProcessor);

      const queue = new Queue(queueName, {
        connection: {
          host: this.configService.get<string>('REDIS_HOST'),
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
            host: this.configService.get<string>('REDIS_HOST'),
            port: 6379,
          },
          concurrency: 3,
        },
      );
      this.workers.push(oidWorker);
      oidWorker.on('active', (job) => {
        const { data } = job.data as {
          data: string;
        };
        console.log(
          `Worker started processing job ${job.id} in queue ${queueName}`,
          job.data,
        );
        console.time(`${data}`);
      });
      oidWorker.on('completed', (job) => {
        const { data } = job.data as {
          data: string;
        };
        console.log(`Worker completed job ${job.id} in queue ${queueName}`);
        console.timeEnd(`${data}`);
      });
      oidWorker.on('failed', (job, err) => {
        const { data } = job?.data as {
          data: string;
        };
        this.logger.log(
          `Worker failed job ${job?.id} in queue ${queueName} with error: ${err.message}`,
        );
        console.timeEnd(`${data}`);
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
