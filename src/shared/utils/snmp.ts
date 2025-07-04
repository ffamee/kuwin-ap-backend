import * as snmp from 'net-snmp';
import { Metrics } from '../types/snmp-metrics';

interface ResolvedOid {
  name: string | null; // ชื่อของ OID เช่น 'client-2.4', 'rx', 'tx'
  macAddress: string | null; // MAC Address ที่ถูกแปลงให้อยู่ในรูปแบบ 'XX:XX:XX:XX:XX:XX'
  originalOid: string; // OID เดิมที่ส่งเข้ามา
}

const resolveSnmpOid = (oid: string): ResolvedOid => {
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

  // 1. ตรวจสอบเงื่อนไขสำหรับ 'client-2.4' หรือ 'client-5' หรือ 'client-6'
  // '1.3.6.1.4.1.14179.2.2.2.1.15.x.x.x.x.x.x.0' หรือ '.1' หรือ '.2'
  const clientBaseOid = '1.3.6.1.4.1.14179.2.2.2.1.15.';
  if (oid.startsWith(clientBaseOid)) {
    const remaining = oid.substring(clientBaseOid.length); // x.x.x.x.x.x.0 หรือ x.x.x.x.x.x.1
    const parts = remaining.split('.');

    if (parts.length === 7) {
      // ต้องมี 6 หลัก MAC + 1 หลักสุดท้าย (.0 หรือ .1 หรือ .2)
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

const feedCb = (
  varbinds: snmp.Varbind[],
  oid: string,
  data: Map<string, Record<string, { value: unknown; type: number }>>,
) => {
  for (let i = 0; i < varbinds.length; i++) {
    const varbind = varbinds[i];

    if (snmp.isVarbindError(varbind)) {
      console.error('Varbind Error:', varbind.oid, snmp.varbindError(varbind));
    } else {
      if (!varbind.oid.startsWith(oid)) {
        console.log(
          `Terminating walk: OID ${varbind.oid} is outside the target subtree.`,
        );
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
        if (name.name === 'rx' || name.name === 'tx') {
          if (
            data.has(name.macAddress) &&
            Object.prototype.hasOwnProperty.call(
              data.get(name.macAddress),
              name.name,
            )
          ) {
            const existing = data.get(name.macAddress) ?? {};
            const val =
              ((existing[name.name]?.value as number) ?? 0) +
              (varbind.value as number);
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
                value: varbind.value as number,
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

export default function walk(session: snmp.Session, oid: string) {
  const data = new Map<string, Record<string, Metrics>>();
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
