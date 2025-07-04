import { Injectable } from '@nestjs/common';
import * as snmp from 'net-snmp';
import { InfluxService } from '../influx/influx.service';
// import { Cron } from '@nestjs/schedule';
import walk from 'src/shared/utils/snmp';
// import { exec } from 'child_process';
// import * as path from 'path';

@Injectable()
export class TaskService {
  constructor(private readonly influxService: InfluxService) {}

  // @Cron('* * * * *')
  async test() {
    /* execute script method
    // const execPath = path.resolve(__dirname, '../../test_c.c');
    // const outPath = path.resolve(__dirname, '../../test.exe');
    // const testSnmp = path.resolve(__dirname, '../../test-snmp');
    // exec(
    // `gcc "${execPath}" -o "${outPath}" && "${outPath}" fame 1234`,
    //   `wsl ./test-snmp`,
    //   { cwd: path.resolve(__dirname, '../../') },
    //   (error, stdout, stderr) => {
    //     if (error) {
    //       console.error(`exec error: ${error.message}`);
    //       return;
    //     }
    //     if (stdout) {
    //       console.log(`stdout: ${stdout}`);
    //     }
    //     if (stderr) {
    //       console.error(`stderr: ${stderr}`);
    //     }
    //   },
    // );
		*/

    /* Get SNMP data example
    // this.session.get(this.oids, function (error, varbinds) {
    //   if (error) {
    //     console.error('Error: ', error.toString());
    //   } else if (varbinds) {
    //     for (let i = 0; i < varbinds.length; i++) {
    //       // for version 2c we must check each OID for an error condition
    //       if (snmp.isVarbindError(varbinds[i]))
    //         console.error(snmp.varbindError(varbinds[i]));
    //       else
    //         console.log(
    //           varbinds[i].oid + ' | ' + (varbinds[i].value as string),
    //         );
    //     }
    //   }
    // });
		*/

    const oidClient = '1.3.6.1.4.1.14179.2.2.2.1.15'; // No. of clients connected to AP
    const oidRx = '1.3.6.1.4.1.9.9.513.1.2.2.1.13'; // Rx bytes
    const oidTx = '1.3.6.1.4.1.9.9.513.1.2.2.1.14'; // Tx bytes
    const oidIp = '1.3.6.1.4.1.14179.2.2.1.1.19'; // IP address of clients
    const session = snmp.createSession('172.16.26.11', 'KUWINTEST', {
      version: snmp.Version['2c'],
    });
    // const session2 = snmp.createSession('172.16.26.10', 'KUWINTEST', {
    //   version: snmp.Version['2c'],
    // });

    // session.walk(oid, maxRepetitions, feedCb, doneCb);
    // wait for walk to complete before closing the session
    // await new Promise((resolve) => {
    //   session.walk(
    //     oidClient,
    //     maxRepetitions,
    //     ClientFeedCb,
    //     doneCb,
    //     // (error: snmp.NetSnmpError) => {
    //     //   if (error) reject(error);
    //     // },
    //   );
    //   // session.walk(oidRx, maxRepetitions, RxTxFeedCb, doneCb);
    //   resolve(true);
    // }).then(() => {
    //   console.log('Walk completed');
    //   console.log('Client:', client);
    //   session.close();
    // });

    try {
      const [rx, tx, client, ip] = await Promise.all([
        walk(session, oidRx),
        walk(session, oidTx),
        walk(session, oidClient),
        walk(session, oidIp),
      ]);
      // for (const mac in data) {
      //   if (Object.prototype.hasOwnProperty.call(data, mac)) {
      //     // Write each client's data to InfluxDB
      //     await this.influxService.writePoint('ap_metrics', data[mac], {
      //       mac_address: mac,
      //     });
      //   }
      // }
      console.log('Data received:', { rx, tx, client, ip });
      // Write data to InfluxDB
      console.log('Walk completed');
      session.close();
    } catch (error) {
      console.error('Error during SNMP walk:', error);
      session.close();
    }
  }
}
