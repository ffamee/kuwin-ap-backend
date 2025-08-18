import * as snmp from 'net-snmp';
import { Metrics } from '../types/snmp-metrics';
import { oidArray } from '../defined/oid';

interface ResolvedOid {
  name: string | null; // OID alias
  key: string | null; // key to indicate specific object (e.g. 'macAddress', 'ssid name', etc.)
  originalOid: string;
  index: string | null; // index for specific metrics value (e.g. '0', '1', '2' for clients, radios, etc.)
}

const resolveSnmpOid = (oid: string): ResolvedOid => {
  const result: ResolvedOid = {
    name: null,
    key: null,
    originalOid: oid,
    index: null,
  };

  const convertOidToMacAddress = (oidMac: string): string => {
    return oidMac
      .split('.')
      .map((segment) => parseInt(segment).toString(16).padStart(2, '0'))
      .join(':');
    // .toUpperCase();
  };

  const convertOidToString = (oidAscii: string[]): string => {
    return oidAscii
      .map((segment) => String.fromCharCode(parseInt(segment)))
      .join('');
  };
  // const clientBaseOid = '1.3.6.1.4.1.14179.2.2.2.1.15.'; // No. of clients connected to AP
  // const rxBaseOid = '1.3.6.1.4.1.9.9.513.1.2.2.1.13.'; // Rx bytes
  // const txBaseOid = '1.3.6.1.4.1.9.9.513.1.2.2.1.14.'; // Tx bytes
  // const ipBaseOid = '1.3.6.1.4.1.14179.2.2.1.1.19.'; // IP address of AP
  // const apStatusBaseOid = '1.3.6.1.4.1.14179.2.2.1.1.6.';
  // const radioStatusBaseOid = '1.3.6.1.4.1.14179.2.2.2.1.12.';
  // const radioBandBaseOid = '1.3.6.1.4.1.9.9.513.1.2.1.1.27.';
  // const channelBaseOid = '1.3.6.1.4.1.14179.2.2.2.1.4.'; // Channel of the AP
  // const ssidNameBaseOid = '1.3.6.1.4.1.9.9.512.1.1.1.1.4.'; // SSID Name in WLC
  // const ssidNumBaseOid = '1.3.6.1.4.1.14179.2.1.1.1.38.'; // No. of AP in each SSID
  // const clientIpBaseOid = '1.3.6.1.4.1.14179.2.1.4.1.2.';
  // const apEthMacBaseOid = '1.3.6.1.4.1.14179.2.2.1.1.33.'; // AP Ethernet MAC Address

  // Huawei OID
  // const huaweiClientBaseOid = '1.3.6.1.4.1.2011.6.139.16.1.2.1.40.'; // Huawei No. of clients connected to AP
  // const huaweiRxBaseOid = '1.3.6.1.4.1.2011.6.139.16.1.2.1.31.'; // Huawei Rx bytes
  // const huaweiTxBaseOid = '1.3.6.1.4.1.2011.6.139.16.1.2.1.36.'; // Huawei Tx bytes
  // const huaweiIpBaseOid = '1.3.6.1.4.1.2011.6.139.13.3.3.1.13.'; // Huawei IP address of AP
  // const huaweiApStatusBaseOid = '1.3.6.1.4.1.2011.6.139.13.3.3.1.6.'; // Huawei AP Status
  // const huaweiRadioStatusBaseOid = '1.3.6.1.4.1.2011.6.139.16.1.2.1.6.'; // Huawei Radio Status
  // const huaweiRadioBandBaseOid = '1.3.6.1.4.1.2011.6.139.16.1.2.1.5.'; // Huawei Radio Band (2.4, 5, 6 GHz)
  // const huaweiChannelBaseOid = '1.3.6.1.4.1.2011.6.139.16.1.2.1.7.'; // Huawei Channel
  // const huaweiApEthMacBaseOid = '1.3.6.1.4.1.2011.6.139.13.3.3.1.39.'; // Huawei AP Ethernet MAC Address

  // '1.3.6.1.4.1.14179.2.2.2.1.15.x.x.x.x.x.x.0' หรือ '.1' หรือ '.2'

  for (const baseOid of oidArray) {
    if (oid.startsWith(baseOid.oid)) {
      const remaining = oid.substring(baseOid.oid.length);
      const parts = remaining.split('.');
      if (baseOid.index === 0 && parts.length === 1 && parts[0] === '') {
        result.name = baseOid.alias;
        break;
      } else if (baseOid.index === -1) {
        result.name = baseOid.alias;
        if (parseInt(parts[0]) === parts.length - 1) {
          result.key = convertOidToString(parts.slice(1, parts.length));
        }
        break;
      } else if (parts.length === baseOid.index) {
        result.name = baseOid.alias;
        if (baseOid.index === 7) {
          const oidMac = parts.slice(0, 6).join('.');
          result.key = convertOidToMacAddress(oidMac); // use key as mac address
          result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
        } else if (baseOid.index === 6) {
          const oidMac = parts.join('.');
          result.key = convertOidToMacAddress(oidMac); // use key as mac address
        } else if (baseOid.index === 1) {
          result.index = parts[0]; // เก็บ index เช่น '0', '1', '2'
        }
      }
      break;
    }
  }

  // if (oid.startsWith(clientBaseOid)) {
  //   const remaining = oid.substring(clientBaseOid.length); // x.x.x.x.x.x.0 หรือ x.x.x.x.x.x.1
  //   const parts = remaining.split('.');

  //   if (parts.length === 7) {
  //     // ต้องมี 6 หลัก MAC + 1 หลักสุดท้าย (.0 หรือ .1 หรือ .2)
  //     const oidMac = parts.slice(0, 6).join('.');
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'client';
  //     result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
  //   }
  // } else if (oid.startsWith(huaweiClientBaseOid)) {
  //   const remaining = oid.substring(huaweiClientBaseOid.length); // x.x.x.x.x
  //   const parts = remaining.split('.');

  //   if (parts.length === 7) {
  //     // ต้องมี 6 หลัก MAC + 1 หลักสุดท้าย (.0 หรือ .1 หรือ .2)
  //     const oidMac = parts.slice(0, 6).join('.');
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'client';
  //     result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
  //   }
  // } else if (oid.startsWith(rxBaseOid)) {
  //   const remaining = oid.substring(rxBaseOid.length); // x.x.x.x.x.x
  //   const parts = remaining.split('.');

  //   if (parts.length === 7) {
  //     // ต้องมี 6 หลัก MAC
  //     const oidMac = parts.slice(0, 6).join('.');
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'rx';
  //     result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
  //   }
  // } else if (oid.startsWith(huaweiRxBaseOid)) {
  //   const remaining = oid.substring(huaweiRxBaseOid.length); // x.x.x.x.x
  //   const parts = remaining.split('.');
  //   if (parts.length === 7) {
  //     // ต้องมี 6 หลัก MAC
  //     const oidMac = parts.slice(0, 6).join('.');
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'rx';
  //     result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
  //   }
  // } else if (oid.startsWith(txBaseOid)) {
  //   const remaining = oid.substring(txBaseOid.length); // x.x.x.x.x.x
  //   const parts = remaining.split('.');

  //   if (parts.length === 7) {
  //     // ต้องมี 6 หลัก MAC
  //     const oidMac = parts.slice(0, 6).join('.');
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'tx';
  //     result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
  //   }
  // } else if (oid.startsWith(huaweiTxBaseOid)) {
  //   const remaining = oid.substring(huaweiTxBaseOid.length); // x.x.x.x.x
  //   const parts = remaining.split('.');
  //   if (parts.length === 7) {
  //     // ต้องมี 6 หลัก MAC
  //     const oidMac = parts.slice(0, 6).join('.');
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'tx';
  //     result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
  //   }
  // } else if (oid.startsWith(ipBaseOid)) {
  //   const remaining = oid.substring(ipBaseOid.length); // x.x.x.x.x.x
  //   const parts = remaining.split('.');

  //   if (parts.length === 6) {
  //     // ต้องมี 6 หลัก MAC
  //     const oidMac = parts.join('.');
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'ip';
  //   }
  // } else if (oid.startsWith(huaweiIpBaseOid)) {
  //   const remaining = oid.substring(huaweiIpBaseOid.length); // x.x.x.x.x
  //   const parts = remaining.split('.');
  //   if (parts.length === 6) {
  //     // ต้องมี 6 หลัก MAC
  //     const oidMac = parts.join('.');
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'ip';
  //   }
  // } else if (oid.startsWith(apStatusBaseOid)) {
  //   const remaining = oid.substring(apStatusBaseOid.length); // x.x.x.x.x.x
  //   const parts = remaining.split('.');
  //   if (parts.length === 6) {
  //     // ต้องมี 6 หลัก MAC
  //     const oidMac = parts.join('.');
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'status';
  //   }
  // } else if (oid.startsWith(huaweiApStatusBaseOid)) {
  //   const remaining = oid.substring(huaweiApStatusBaseOid.length); // x.x.x.x.x.x
  //   const parts = remaining.split('.');
  //   if (parts.length === 6) {
  //     // ต้องมี 6 หลัก MAC
  //     const oidMac = parts.join('.');
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'status';
  //   }
  // } else if (oid.startsWith(radioStatusBaseOid)) {
  //   const remaining = oid.substring(radioStatusBaseOid.length); // x.x.x.x.x.x.0 .1 .2
  //   const parts = remaining.split('.');
  //   if (parts.length === 7) {
  //     // ต้องมี 6 หลัก MAC + 1 หลักสุดท้าย (.0 หรือ .1 หรือ .2)
  //     const oidMac = parts.slice(0, 6).join('.');
  //     // const lastSegment = parts[6];
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'radio';
  //     result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
  //   }
  // } else if (oid.startsWith(huaweiRadioStatusBaseOid)) {
  //   const remaining = oid.substring(huaweiRadioStatusBaseOid.length); // x.x.x.x.x.x.0 .1 .2
  //   const parts = remaining.split('.');
  //   if (parts.length === 7) {
  //     // ต้องมี 6 หลัก MAC + 1 หลักสุดท้าย (.0 หรือ .1 หรือ .2)
  //     const oidMac = parts.slice(0, 6).join('.');
  //     // const lastSegment = parts[6];
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'radio';
  //     result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
  //   }
  // } else if (oid.startsWith(radioBandBaseOid)) {
  //   const remaining = oid.substring(radioBandBaseOid.length); // x.x.x.x.x.x.0 .1 .2
  //   const parts = remaining.split('.');
  //   if (parts.length === 7) {
  //     // ต้องมี 6 หลัก MAC + 1 หลักสุดท้าย (.0 หรือ .1 หรือ .2)
  //     const oidMac = parts.slice(0, 6).join('.');
  //     // const lastSegment = parts[6];
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'band';
  //     result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
  //   }
  // } else if (oid.startsWith(huaweiRadioBandBaseOid)) {
  //   const remaining = oid.substring(huaweiRadioBandBaseOid.length); // x.x.x.x.x.x.0 .1 .2
  //   const parts = remaining.split('.');
  //   if (parts.length === 7) {
  //     // ต้องมี 6 หลัก MAC + 1 หลักสุดท้าย (.0 หรือ .1 หรือ .2)
  //     const oidMac = parts.slice(0, 6).join('.');
  //     // const lastSegment = parts[6];
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'band';
  //     result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
  //   }
  // } else if (oid.startsWith(channelBaseOid)) {
  //   const remaining = oid.substring(channelBaseOid.length); // x.x.x.x.x.x
  //   const parts = remaining.split('.');
  //   if (parts.length === 7) {
  //     // ต้องมี 6 หลัก MAC
  //     const oidMac = parts.slice(0, 6).join('.');
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'channel';
  //     result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
  //   }
  // } else if (oid.startsWith(huaweiChannelBaseOid)) {
  //   const remaining = oid.substring(huaweiChannelBaseOid.length); // x.x.x.x.x.x
  //   const parts = remaining.split('.');
  //   if (parts.length === 7) {
  //     // ต้องมี 6 หลัก MAC
  //     const oidMac = parts.slice(0, 6).join('.');
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'channel';
  //     result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
  //   }
  // } else if (oid.startsWith(ssidNameBaseOid)) {
  //   const remaining = oid.substring(ssidNameBaseOid.length); // baseOid.index
  //   if (!remaining.includes('.')) {
  //     result.name = 'ssid';
  //     result.index = remaining; // เก็บ index เช่น '0', '1', '2'
  //   }
  // } else if (oid.startsWith(ssidNumBaseOid)) {
  //   const remaining = oid.substring(ssidNumBaseOid.length); // baseOid.index
  //   if (!remaining.includes('.')) {
  //     result.name = 'ssidAP';
  //     result.index = remaining; // เก็บ index เช่น '0', '1', '2'
  //   }
  // } else if (oid.startsWith(clientIpBaseOid)) {
  //   const remaining = oid.substring(clientIpBaseOid.length); // x.x.x.x.x.x
  //   const parts = remaining.split('.');
  //   if (parts.length === 6) {
  //     // ต้องมี 6 หลัก MAC
  //     const oidMac = parts.join('.');
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'clientIp';
  //   }
  // } else if (oid.startsWith(apEthMacBaseOid)) {
  //   const remaining = oid.substring(apEthMacBaseOid.length); // x.x.x.x.x
  //   const parts = remaining.split('.');
  //   if (parts.length === 6) {
  //     // ต้องมี 6 หลัก MAC
  //     const oidMac = parts.join('.');
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'ethMac';
  //   }
  // } else if (oid.startsWith(huaweiApEthMacBaseOid)) {
  //   const remaining = oid.substring(huaweiApEthMacBaseOid.length); // x.x.x
  //   const parts = remaining.split('.');
  //   if (parts.length === 6) {
  //     // ต้องมี 6 หลัก MAC
  //     const oidMac = parts.join('.');
  //     result.macAddress = convertOidMacToStandard(oidMac);
  //     result.name = 'ethMac';
  //   }
  // }

  return result;
};

const feedCb = (
  varbinds: snmp.Varbind[],
  oid: string,
  data: Map<string, Record<string, unknown>>,
) => {
  for (let i = 0; i < varbinds.length; i++) {
    const varbind = varbinds[i];

    if (snmp.isVarbindError(varbind)) {
      console.error('Varbind Error:', varbind.oid, snmp.varbindError(varbind));
    } else {
      if (!varbind.oid.startsWith(oid)) {
        // console.log(
        //   `Terminating walk: OID ${varbind.oid} is outside the target subtree.`,
        // );
        return {
          terminated: true,
          reason: 'OID out of subtree',
          lastOid: varbind.oid,
        };
      }
      try {
        const name = resolveSnmpOid(varbind.oid);
        if (!name.name) {
          console.log(name);
          continue; // Skip if name is not resolved
        } else if (!name.key) {
          if (name.index) {
            data.set(name.index, {
              ...data.get(name.index),
              [name.name]: {
                value: varbind.value,
                type: varbind.type,
              },
            });
          }
        } else {
          if (name.index) {
            // treat it like object for keys '0', '1', '2' etc.
            if (
              data.has(name.key) &&
              Object.prototype.hasOwnProperty.call(
                data.get(name.key),
                name.name,
              )
            ) {
              const existing = data.get(name.key) ?? {};
              const val =
                ((existing[name.name] as Metrics)?.value as Record<
                  string,
                  unknown
                >) ?? {};
              val[name.index] = varbind.value;
              data.set(name.key, {
                ...data.get(name.key),
                [name.name]: {
                  value: val,
                  type: varbind.type,
                },
              });
            } else {
              data.set(name.key, {
                ...data.get(name.key),
                [name.name]: {
                  value: {
                    [name.index]: varbind.value,
                  },
                  type: varbind.type,
                },
              });
            }
          } else
            data.set(name.key, {
              ...data.get(name.key),
              [name.name]: {
                value: varbind.value,
                type: varbind.type,
              },
            });
        }
      } catch (error) {
        console.error('Error resolving OID:', varbind.oid, error);
      }
    }
  }
  return null; // คืนค่า null เพื่อให้ walk ดำเนินต่อไป
};

const maxRepetitions = 20; // จำนวนสูงสุดของการทำซ้ำในแต่ละการเดิน

export function walk(session: snmp.Session, oid: string) {
  const data = new Map<string, Record<string, unknown>>();
  return new Promise((resolve, reject) => {
    session.walk(
      oid,
      maxRepetitions,
      (varbinds: snmp.Varbind[]) => {
        return feedCb(varbinds, oid, data);
      },
      (error: snmp.NetSnmpError) => {
        if (error) {
          reject(error);
        }
        resolve(Object.fromEntries(data.entries()));
      },
    );
  });
}

export function get(session: snmp.Session, oid: string) {
  return new Promise((resolve, reject) => {
    session.get([oid], function (error, varbinds) {
      if (error) {
        console.error('Error: ', error.toString());
        reject(error);
      } else if (varbinds) {
        for (let i = 0; i < varbinds.length; i++) {
          // for version 2c we must check each OID for an error condition
          if (snmp.isVarbindError(varbinds[i]))
            console.error(snmp.varbindError(varbinds[i]));
          resolve(varbinds[i].value);
        }
      }
    });
  });
}
