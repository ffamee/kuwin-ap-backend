import * as snmp from 'net-snmp';
import { Metrics } from '../types/snmp-metrics';

interface ResolvedOid {
  name: string | null; // ชื่อของ OID เช่น 'client-2.4', 'rx', 'tx'
  macAddress: string | null; // MAC Address ที่ถูกแปลงให้อยู่ในรูปแบบ 'XX:XX:XX:XX:XX:XX'
  originalOid: string; // OID เดิมที่ส่งเข้ามา
  index: string | null; // ชื่อ index ของ OID เช่น '0', '1', '2' สำหรับ client, radio, band
}

const resolveSnmpOid = (oid: string): ResolvedOid => {
  const result: ResolvedOid = {
    name: null,
    macAddress: null,
    originalOid: oid,
    index: null,
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
  const clientBaseOid = '1.3.6.1.4.1.14179.2.2.2.1.15.'; // No. of clients connected to AP
  const rxBaseOid = '1.3.6.1.4.1.9.9.513.1.2.2.1.13.'; // Rx bytes
  const txBaseOid = '1.3.6.1.4.1.9.9.513.1.2.2.1.14.'; // Tx bytes
  const ipBaseOid = '1.3.6.1.4.1.14179.2.2.1.1.19.'; // IP address of AP
  const apStatusBaseOid = '1.3.6.1.4.1.14179.2.2.1.1.6.';
  const radioStatusBaseOid = '1.3.6.1.4.1.14179.2.2.2.1.12.';
  const radioBandBaseOid = '1.3.6.1.4.1.9.9.513.1.2.1.1.27.';
  const channelBaseOid = '1.3.6.1.4.1.14179.2.2.2.1.4.'; // Channel of the AP

  // 1. ตรวจสอบเงื่อนไขสำหรับ 'client-2.4' หรือ 'client-5' หรือ 'client-6'
  // '1.3.6.1.4.1.14179.2.2.2.1.15.x.x.x.x.x.x.0' หรือ '.1' หรือ '.2'
  if (oid.startsWith(clientBaseOid)) {
    const remaining = oid.substring(clientBaseOid.length); // x.x.x.x.x.x.0 หรือ x.x.x.x.x.x.1
    const parts = remaining.split('.');

    if (parts.length === 7) {
      // ต้องมี 6 หลัก MAC + 1 หลักสุดท้าย (.0 หรือ .1 หรือ .2)
      const oidMac = parts.slice(0, 6).join('.');
      // const lastSegment = parts[6];

      result.macAddress = convertOidMacToStandard(oidMac);

      // if (lastSegment === '0') {
      //   result.name = 'client-24';
      // } else if (lastSegment === '1') {
      //   result.name = 'client-5';
      // } else if (lastSegment === '2') {
      //   result.name = 'client-6';
      // }
      result.name = 'client';
      result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
    }
  } else if (oid.startsWith(rxBaseOid)) {
    const remaining = oid.substring(rxBaseOid.length); // x.x.x.x.x.x
    const parts = remaining.split('.');

    if (parts.length === 7) {
      // ต้องมี 6 หลัก MAC
      const oidMac = parts.slice(0, 6).join('.');
      result.macAddress = convertOidMacToStandard(oidMac);
      result.name = 'rx';
      result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
    }
  } else if (oid.startsWith(txBaseOid)) {
    const remaining = oid.substring(txBaseOid.length); // x.x.x.x.x.x
    const parts = remaining.split('.');

    if (parts.length === 7) {
      // ต้องมี 6 หลัก MAC
      const oidMac = parts.slice(0, 6).join('.');
      result.macAddress = convertOidMacToStandard(oidMac);
      result.name = 'tx';
      result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
    }
  } else if (oid.startsWith(ipBaseOid)) {
    const remaining = oid.substring(ipBaseOid.length); // x.x.x.x.x.x
    const parts = remaining.split('.');

    if (parts.length === 6) {
      // ต้องมี 6 หลัก MAC
      const oidMac = parts.join('.');
      result.macAddress = convertOidMacToStandard(oidMac);
      result.name = 'ip';
    }
  } else if (oid.startsWith(apStatusBaseOid)) {
    const remaining = oid.substring(apStatusBaseOid.length); // x.x.x.x.x.x
    const parts = remaining.split('.');
    if (parts.length === 6) {
      // ต้องมี 6 หลัก MAC
      const oidMac = parts.join('.');
      result.macAddress = convertOidMacToStandard(oidMac);
      result.name = 'status';
    }
  } else if (oid.startsWith(radioStatusBaseOid)) {
    const remaining = oid.substring(radioStatusBaseOid.length); // x.x.x.x.x.x.0 .1 .2
    const parts = remaining.split('.');
    if (parts.length === 7) {
      // ต้องมี 6 หลัก MAC + 1 หลักสุดท้าย (.0 หรือ .1 หรือ .2)
      const oidMac = parts.slice(0, 6).join('.');
      // const lastSegment = parts[6];
      result.macAddress = convertOidMacToStandard(oidMac);
      // if (lastSegment === '0') {
      //   result.name = 'radio-24';
      // } else if (lastSegment === '1') {
      //   result.name = 'radio-5';
      // } else if (lastSegment === '2') {
      //   result.name = 'radio-6';
      // }
      result.name = 'radio';
      result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
    }
  } else if (oid.startsWith(radioBandBaseOid)) {
    const remaining = oid.substring(radioBandBaseOid.length); // x.x.x.x.x.x.0 .1 .2
    const parts = remaining.split('.');
    if (parts.length === 7) {
      // ต้องมี 6 หลัก MAC + 1 หลักสุดท้าย (.0 หรือ .1 หรือ .2)
      const oidMac = parts.slice(0, 6).join('.');
      // const lastSegment = parts[6];
      result.macAddress = convertOidMacToStandard(oidMac);
      // if (lastSegment === '0') {
      //   result.name = 'radio-band-24';
      // } else if (lastSegment === '1') {
      //   result.name = 'radio-band-5';
      // } else if (lastSegment === '2') {
      //   result.name = 'radio-band-6';
      // }
      result.name = 'band';
      result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
    }
  } else if (oid.startsWith(channelBaseOid)) {
    const remaining = oid.substring(channelBaseOid.length); // x.x.x.x.x.x
    const parts = remaining.split('.');
    if (parts.length === 7) {
      // ต้องมี 6 หลัก MAC
      const oidMac = parts.slice(0, 6).join('.');
      result.macAddress = convertOidMacToStandard(oidMac);
      result.name = 'channel';
      result.index = parts[6]; // เก็บ index เช่น '0', '1', '2'
    }
  }

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
        if (!name.name || !name.macAddress) {
          console.log(name);
          continue; // Skip if name or macAddress is not resolved
        }
        if (name.index) {
          // treat it like object for keys '0', '1', '2' etc.
          if (
            data.has(name.macAddress) &&
            Object.prototype.hasOwnProperty.call(
              data.get(name.macAddress),
              name.name,
            )
          ) {
            const existing = data.get(name.macAddress) ?? {};
            const val =
              ((existing[name.name] as Metrics)?.value as Record<
                string,
                unknown
              >) ?? {};
            val[name.index] = varbind.value;
            data.set(name.macAddress, {
              ...data.get(name.macAddress),
              [name.name]: {
                value: val,
                type: varbind.type,
              },
            });
          } else {
            data.set(name.macAddress, {
              ...data.get(name.macAddress),
              [name.name]: {
                value: {
                  [name.index]: varbind.value,
                },
                type: varbind.type,
              },
            });
          }
        } else
          data.set(name.macAddress, {
            ...data.get(name.macAddress),
            [name.name]: {
              value: varbind.value,
              type: varbind.type,
            },
          });
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
