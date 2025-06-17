import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as snmp from 'net-snmp';
// import { exec } from 'child_process';
// import * as path from 'path';

@Injectable()
export class TaskService {
  private readonly oids = [`1.3.6.1.4.1.14179.2.2.1.1.3.204.127.117.89.34.32`];

  @Cron(CronExpression.EVERY_5_MINUTES)
  handleCron() {
    console.log('Called Every 5 Minutes', new Date().toISOString());
  }

  // This method is called every minute using the cron expression '* * * * *'
  @Cron('* * * * *')
  handleOwnExpression() {
    console.log('Called Every Minute', snmp.Version['2c']);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  // @Interval(5000)
  async test() {
    // console log every key in snmp version type
    console.log('Called Every 10 Seconds');
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
    const oidClient = '1.3.6.1.4.1.14179.2.2.2.1.15'; // No. of clients connected to AP
    const oidRx = '1.3.6.1.4.1.9.9.513.1.2.2.1.13'; // Rx bytes
    // const oidTx = '1.3.6.1.4.1.9.9.513.1.2.2.1.14'; // Tx bytes
    const session = snmp.createSession('172.16.26.11', 'KUWINTEST', {
      version: snmp.Version['2c'],
    });

    function doneCb(error: snmp.NetSnmpError) {
      if (error) console.error(error.message);
    }

    // function feedCb(varbinds: snmp.Varbind[]) {
    //   for (let i = 0; i < varbinds.length; i++) {
    //     if (snmp.isVarbindError(varbinds[i]))
    //       console.error(snmp.varbindError(varbinds[i]));
    //     else console.log(varbinds[i].oid + '|' + (varbinds[i].value as string));
    //   }
    // }
    function feedCb(
      varbinds: snmp.Varbind[],
      oid: string,
      display: (varbind: snmp.Varbind) => void,
      terminated?: (varbind: snmp.Varbind) => void,
    ) {
      for (let i = 0; i < varbinds.length; i++) {
        const varbind = varbinds[i];

        if (snmp.isVarbindError(varbind)) {
          console.error(
            'Varbind Error:',
            varbind.oid,
            snmp.varbindError(varbind),
          );
        } else {
          // ตรวจสอบ OID เพื่อหยุดการ walk
          // คุณต้องกำหนดเงื่อนไขการหยุดที่เหมาะสมกับ MIB ของคุณ
          // ตัวอย่าง: ถ้าต้องการหยุดเมื่อ OID ออกนอก subtree ที่เริ่มต้น
          // .substring(0, oid.lastIndexOf('.'))
          if (terminated ? terminated(varbind) : !varbind.oid.startsWith(oid)) {
            console.log(
              `Terminating walk: OID ${varbind.oid} is outside the target subtree.`,
            );
            return {
              terminated: true,
              reason: 'OID out of subtree',
              lastOid: varbind.oid,
            };
          }
          // display the varbind by calling the provided display function
          display(varbind);

          // หรือถ้าต้องการหยุดที่ OID ตัวใดตัวหนึ่งโดยเฉพาะ
          // if (varbind.oid === '1.3.6.1.4.1.14179.2.2.1.1.3.999') { // สมมติว่ามี OID นี้
          //     console.log(`Terminating walk: Reached specific OID ${varbind.oid}`);
          //     return { terminated: true, reason: "Reached specific OID", lastOid: varbind.oid };
          // }

          // หรือถ้าคุณมีขอบเขต OID ชัดเจนว่าต้องการหยุดที่ไหน
          // เช่น ถ้า '1.3.6.1.4.1.14179.2.2.1.1.3' เป็นจุดเริ่มต้นของ array/table
          // และอยากจะหยุดเมื่อ OID index นั้นๆ เกินกว่าค่าที่กำหนด
          // คุณอาจจะต้องแยก OID เป็นส่วนๆ แล้วเปรียบเทียบ
          // ตัวอย่าง:
          // const oidParts =
          //   typeof varbind.oid === 'string'
          //     ? varbind.oid.split('.').map(Number)
          //     : varbind.oid;
          // const baseOidParts = targetOidPrefix.split('.').map(Number);

          // สมมติว่า '1.3.6.1.4.1.14179.2.2.1.1.3' คือ base OID ของ table index
          // และคุณต้องการเดินแค่ 100 instance ถัดจาก OID นั้น
          // คุณต้องหา index ของ instance ใน OID นั้น
          // if (oidParts.length > baseOidParts.length) {
          //   const instanceIndex = oidParts[baseOidParts.length]; // เช่น 1.3.6.1.4.1.14179.2.2.1.1.3.<instanceIndex>
          //   // สมมติว่าต้องการหยุดเมื่อ instanceIndex เกิน 10
          //   if (instanceIndex > 100) {
          //     // หรือค่าอื่นๆ ที่คุณต้องการ
          //     console.log(
          //       `Terminating walk: Instance index ${instanceIndex} exceeds limit.`,
          //     );
          //     return {
          //       terminated: true,
          //       reason: 'Instance limit reached',
          //       lastOid: varbind.oid,
          //     };
          //   }
          // }
        }
      }
      return null; // คืนค่า null เพื่อให้ walk ดำเนินต่อไป
    }

    function ClientFeedCb(varbinds: snmp.Varbind[]) {
      return feedCb(varbinds, oidClient, (varbind: snmp.Varbind) => {
        console.log(varbind.oid + ' | ' + (varbind.value as string));
      });
    }
    function RxTxFeedCb(varbinds: snmp.Varbind[]) {
      return feedCb(
        varbinds,
        oidRx,
        (varbind: snmp.Varbind) => {
          const value = varbind.value as number;
          const out =
            (varbind.oid.split('.')[13] === '13'
              ? 'Received Rate '
              : 'Transmitted Rate ') +
            ('of ' + varbind.oid + ' | ');
          if (value > 1 << 30) {
            console.log(out + (value / (1 << 30)).toFixed(2) + ' GB');
          } else if (value > 1 << 20) {
            console.log(out + (value / (1 << 20)).toFixed(2) + ' MB');
          } else if (value > 1 << 10) {
            console.log(out + (value / (1 << 10)).toFixed(2) + ' KB');
          } else {
            console.log(out + value + ' B');
          }
        },
        (varbind: snmp.Varbind) =>
          varbind.oid >= '1.3.6.1.4.1.9.9.513.1.2.2.1.15',
      );
    }
    // function MacFeedCb(varbinds: snmp.Varbind[]) {
    //   return feedCb(varbinds, oidClient, (varbind: snmp.Varbind) => {
    //     console.log(
    //       varbind.oid +
    //         ' | ' +
    //         (varbind.value as Buffer)
    //           .toString('hex')
    //           .toUpperCase()
    //           .replace(/(.{2})/g, '$1 ')
    //           .trim(),
    //     );
    //   });
    // }

    const maxRepetitions = 20;

    // session.walk(oid, maxRepetitions, feedCb, doneCb);
    // wait for walk to complete before closing the session
    await new Promise(() => {
      session.walk(oidClient, maxRepetitions, ClientFeedCb, doneCb);
      session.walk(oidRx, maxRepetitions, RxTxFeedCb, doneCb);
    }).then(() => session.close());
  }
}
