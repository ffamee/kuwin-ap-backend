import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import * as snmp from 'net-snmp';
import { walk } from 'src/shared/utils/snmp';

@Injectable()
export class OidPollingProcessor {
  async process(job: Job) {
    const { wlcHost, oid } = job.data as {
      wlcHost: string;
      oid: string;
    };
    const session = snmp.createSession(wlcHost, 'KUWINTEST', {
      version: snmp.Version['2c'],
    });
    // Simulate some processing logic
    // await new Promise((resolve) =>
    //   setTimeout(resolve, Math.random() * 10000 + 5000),
    // );

    // // Randomly throw an error to simulate failure
    // if (Math.random() > 0.9) {
    //   session.close();
    //   throw new Error(
    //     `Random failure occurred! on job ${oid} for WLC ${wlcName}`,
    //   );
    // }
    // // Return a boolean value to indicate success
    // return !!(Math.random() > 0.5);
    // return job.data.oid;
    try {
      const res = await walk(session, oid);
      session.close();
      return res;
    } catch (error) {
      session.close();
      throw error; // Rethrow the error to indicate failure
    }
  }
}
