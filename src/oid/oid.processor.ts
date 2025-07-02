import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

@Injectable()
export class OidPollingProcessor {
  async process(job: Job): Promise<boolean> {
    // Simulate some processing logic
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 10000 + 5000),
    );

    // Randomly throw an error to simulate failure
    if (Math.random() > 0.9) {
      throw new Error(`Random failure occurred! on job ${job.id}`);
    }

    // Return a boolean value to indicate success
    return !!(Math.random() > 0.5);
  }
}
