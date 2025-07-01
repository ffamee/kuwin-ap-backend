import { Injectable, Ip } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as snmp from 'net-snmp';
import { InfluxService } from '../influx/influx.service';
// import { exec } from 'child_process';
// import * as path from 'path';
interface ResolvedOid {
  name: string | null; // ชื่อของ OID เช่น 'client-2.4', 'rx', 'tx'
  macAddress: string | null; // MAC Address ที่ถูกแปลงให้อยู่ในรูปแบบ 'XX:XX:XX:XX:XX:XX'
  originalOid: string; // OID เดิมที่ส่งเข้ามา
}

@Injectable()
export class TaskService {
  // private readonly oids = [`1.3.6.1.4.1.14179.2.2.1.1.3.204.127.117.89.34.32`];
  private resolveSnmpOid = (oid: string): ResolvedOid => {
    const result: ResolvedOid = {
      name: null,
      macAddress: null,
      originalOid: oid,
    };

    // Helper function to convert OID-style MAC to standard MAC address
    // e.g., '1.2.3.4.5.6' -> '01:02:03:04:05:06'
    const convertOidMacToStandard = (oidMac: string): string => {
      return oidMac
        .split('.')
        .map((segment) => parseInt(segment).toString(16).padStart(2, '0'))
        .join(':');
      // .toUpperCase();
    };

    // 1. ตรวจสอบเงื่อนไขสำหรับ 'client-2.4' หรือ 'client-5'
    // '1.3.6.1.4.1.14179.2.2.2.1.15.x.x.x.x.x.x.0' หรือ '.1'
    const clientBaseOid = '1.3.6.1.4.1.14179.2.2.2.1.15.';
    if (oid.startsWith(clientBaseOid)) {
      const remaining = oid.substring(clientBaseOid.length); // x.x.x.x.x.x.0 หรือ x.x.x.x.x.x.1
      const parts = remaining.split('.');

      if (parts.length === 7) {
        // ต้องมี 6 หลัก MAC + 1 หลักสุดท้าย (.0 หรือ .1)
        const oidMac = parts.slice(0, 6).join('.');
        const lastSegment = parts[6];

        result.macAddress = convertOidMacToStandard(oidMac);

        if (lastSegment === '0') {
          result.name = 'client-2.4';
        } else if (lastSegment === '1') {
          result.name = 'client-5';
        } else if (lastSegment === '2') {
          result.name = 'client-6';
        }
      }
    }

    // 2. ตรวจสอบเงื่อนไขสำหรับ 'rx'
    // '1.3.6.1.4.1.9.9.513.1.2.2.1.13.x.x.x.x.x.x'
    const rxBaseOid = '1.3.6.1.4.1.9.9.513.1.2.2.1.13.';
    if (oid.startsWith(rxBaseOid)) {
      const remaining = oid.substring(rxBaseOid.length); // x.x.x.x.x.x
      const parts = remaining.split('.');

      if (parts.length === 7) {
        // ต้องมี 6 หลัก MAC
        const oidMac = parts.slice(0, 6).join('.');
        result.macAddress = convertOidMacToStandard(oidMac);
        result.name = 'rx';
      }
    }

    // 3. ตรวจสอบเงื่อนไขสำหรับ 'tx'
    // '1.3.6.1.4.1.9.9.513.1.2.2.1.14.x.x.x.x.x.x'
    const txBaseOid = '1.3.6.1.4.1.9.9.513.1.2.2.1.14.';
    if (oid.startsWith(txBaseOid)) {
      const remaining = oid.substring(txBaseOid.length); // x.x.x.x.x.x
      const parts = remaining.split('.');

      if (parts.length === 7) {
        // ต้องมี 6 หลัก MAC
        const oidMac = parts.slice(0, 6).join('.');
        result.macAddress = convertOidMacToStandard(oidMac);
        result.name = 'tx';
      }
    }

    const ipBaseOid = '1.3.6.1.4.1.14179.2.2.1.1.19.';
    if (oid.startsWith(ipBaseOid)) {
      const remaining = oid.substring(ipBaseOid.length); // x.x.x.x.x.x
      const parts = remaining.split('.');

      if (parts.length === 6) {
        // ต้องมี 6 หลัก MAC
        const oidMac = parts.join('.');
        result.macAddress = convertOidMacToStandard(oidMac);
        result.name = 'ip';
      }
    }

    return result;
  };

  constructor(private readonly influxService: InfluxService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  handleCron() {
    console.log('Called Every 5 Minutes', new Date().toISOString());
  }

  // This method is called every minute using the cron expression '* * * * *'
  // @Cron('* * * * *')
  // handleOwnExpression() {
  //   console.log('Called Every Minute');
  // }

  // @Cron('* * * * *')
  @Cron(CronExpression.EVERY_5_MINUTES)
  // @Interval(5000)
  async test() {
    // console log every key in snmp version type
    console.log('Called Every 5 minute');
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
    // const client: Record<string, number> = {};
    const data: Record<string, Record<string, any>> = {};
    const oidClient = '1.3.6.1.4.1.14179.2.2.2.1.15'; // No. of clients connected to AP
    const oidRx = '1.3.6.1.4.1.9.9.513.1.2.2.1.13'; // Rx bytes
    // const oidTx = '1.3.6.1.4.1.9.9.513.1.2.2.1.14'; // Tx bytes
    const oidIp = '1.3.6.1.4.1.14179.2.2.1.1.19'; // IP address of clients
    const session = snmp.createSession('172.16.26.12', 'KUWINTEST', {
      version: snmp.Version['2c'],
    });
    const session2 = snmp.createSession('172.16.26.10', 'KUWINTEST', {
      version: snmp.Version['2c'],
    });

    // function doneCb(error: snmp.NetSnmpError) {
    //   if (error) console.error(error.message);
    // }

    // function feedCb(varbinds: snmp.Varbind[]) {
    //   for (let i = 0; i < varbinds.length; i++) {
    //     if (snmp.isVarbindError(varbinds[i]))
    //       console.error(snmp.varbindError(varbinds[i]));
    //     else console.log(varbinds[i].oid + '|' + (varbinds[i].value as string));
    //   }
    // }
    const feedCb = (
      varbinds: snmp.Varbind[],
      oid: string,
      display: (varbind: snmp.Varbind) => void,
      terminated?: (varbind: snmp.Varbind) => void,
    ) => {
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
          // display(varbind);
          try {
            const name = this.resolveSnmpOid(varbind.oid);
            if (!name.name || !name.macAddress) {
              console.log(name);
              continue; // Skip if name or macAddress is not resolved
            }
            const val =
              name.name === 'rx' || name.name === 'tx'
                ? ((data[name.macAddress]
                    ? (data[name.macAddress][name.name] ?? 0)
                    : 0) as number) + (varbind.value as number)
                : varbind.value;
            data[name.macAddress] = {
              ...data[name.macAddress],
              [name.name]: val,
            };
          } catch (error) {
            console.error('Error resolving OID:', varbind.oid, error);
          }
        }
      }
      return null; // คืนค่า null เพื่อให้ walk ดำเนินต่อไป
    };

    const IpFeedCb = (varbinds: snmp.Varbind[]) => {
      return feedCb(varbinds, oidIp, (varbind: snmp.Varbind) => {
        console.log(varbind.oid + ' | ' + (varbind.value as string));
      });
    };
    const ClientFeedCb = (varbinds: snmp.Varbind[]) => {
      return feedCb(varbinds, oidClient, (varbind: snmp.Varbind) => {
        console.log(varbind.oid + ' | ' + (varbind.value as string));
      });
    };
    const RxTxFeedCb = (varbinds: snmp.Varbind[]) => {
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
    };
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

    function walkClient(session: snmp.Session) {
      return new Promise((resolve, reject) => {
        session.walk(
          oidClient,
          maxRepetitions,
          ClientFeedCb,
          (error: snmp.NetSnmpError) => {
            if (error) {
              reject(error);
            }
            resolve(true);
          },
        );
      });
    }

    function walkRxTx(session: snmp.Session) {
      return new Promise((resolve, reject) => {
        session.walk(
          oidRx,
          maxRepetitions,
          RxTxFeedCb,
          (error: snmp.NetSnmpError) => {
            if (error) {
              reject(error);
            }
            resolve(true);
          },
        );
      });
    }

    function walkIp(session: snmp.Session) {
      return new Promise((resolve, reject) => {
        session.walk(
          oidIp,
          maxRepetitions,
          IpFeedCb,
          (error: snmp.NetSnmpError) => {
            if (error) {
              reject(error);
            }
            resolve(true);
          },
        );
      });
    }

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
      await Promise.all([
        walkClient(session),
        walkRxTx(session),
        // walkClient(session2),
        // walkRxTx(session2),
      ]);
      for (const mac in data) {
        if (Object.prototype.hasOwnProperty.call(data, mac)) {
          // Write each client's data to InfluxDB
          await this.influxService.writePoint('ap_metrics', data[mac], {
            mac_address: mac,
          });
        }
      }
      // console.log('Data collected:', data);
      console.log('Walk completed');
      session.close();
    } catch (error) {
      console.error('Error during SNMP walk:', error);
      session.close();
    }

    // const sessionHuawei = snmp.createSession('172.16.26.16', 'KUWINTEST', {
    //   version: snmp.Version['2c'],
    // });

    // const oidHuawei = '1.2.156.11235.6001.60.7.2.75.2.1.1.1.2';
    // sessionHuawei.walk(
    //   oidHuawei,
    //   maxRepetitions,
    //   (varbinds: snmp.Varbind[]) => {
    //     for (let i = 0; i < varbinds.length; i++) {
    //       const varbind = varbinds[i];
    //       if (snmp.isVarbindError(varbind)) {
    //         console.error(
    //           'Varbind Error:',
    //           varbind.oid,
    //           snmp.varbindError(varbind),
    //         );
    //       } else {
    //         if (!varbind.oid.startsWith(oidHuawei)) {
    //           console.log(
    //             `Terminating Huawei walk: OID ${varbind.oid} is outside the target subtree.`,
    //           );
    //           return {
    //             terminated: true,
    //             reason: 'OID out of subtree',
    //             lastOid: varbind.oid,
    //           };
    //         }
    //         console.log(varbind.oid + ' | ' + (varbind.value as string));
    //       }
    //     }
    //   },
    //   (error: snmp.NetSnmpError) => {
    //     if (error) {
    //       console.error('Error during SNMP walk:', error.message);
    //     } else {
    //       console.log('Huawei SNMP walk completed successfully');
    //     }
    //     sessionHuawei.close();
    //   },
    // );

    // try {
    //   await walkIp(session);
    //   await walkIp(session2);
    //   for (const mac in data) {
    //     if (Object.prototype.hasOwnProperty.call(data, mac)) {
    //       // Write each client's data to InfluxDB
    //       await this.influxService.writePoint('check_ip', data[mac], {
    //         mac_address: mac,
    //       });
    //     }
    //   }
    //   // console.log('Data collected:', data);
    //   // console.log('Data collected:', data);
    //   console.log('Walk completed');
    //   session.close();
    // } catch (error) {
    //   console.error('Error during SNMP walk:', error);
    //   session.close();
    // }
  }
}
