const oids = {
  cisco: {
    /**
     * @alias client
     * @description
     * OID for the number of clients connected to the AP.
     * This OID is used with the MAC address of the AP and radio index by appending the decimal MAC address and radio index to the base OID.
     *
     * For example:
     * ```
     * clientBaseOid + '.<decMac>' + '.<radioIndex>'
     * ```
     */
    clientBaseOid: {
      oid: '1.3.6.1.4.1.14179.2.2.2.1.15',
      index: 7,
      alias: 'client',
    },
    /**
     * @alias rx
     * @description
     * OID for the number of RX bytes.
     * This OID is used with the MAC address of the AP and radio index by appending the decimal MAC address and radio index to the base OID.
     *
     * For example:
     * ```
     * rxBaseOid + '.<decMac>' + '.<radioIndex>'
     * ```
     */
    rxBaseOid: { oid: '1.3.6.1.4.1.9.9.513.1.2.2.1.13', index: 7, alias: 'rx' },
    /**
     * @alias tx
     * @description
     * OID for the number of TX bytes.
     * This OID is used with the MAC address of the AP and radio index by appending the decimal MAC address and radio index to the base OID.
     *
     * For example:
     * ```
     * txBaseOid + '.<decMac>' + '.<radioIndex>'
     * ```
     */
    txBaseOid: { oid: '1.3.6.1.4.1.9.9.513.1.2.2.1.14', index: 7, alias: 'tx' },
    /**
     * @alias ip
     * @description
     * OID for the IP address of the AP.
     * This OID is used with the MAC address of the AP by appending the decimal MAC address to the base OID.
     *
     * For example:
     * ```
     * ipBaseOid + '.<decMac>'
     * ```
     */
    ipBaseOid: { oid: '1.3.6.1.4.1.14179.2.2.1.1.19', index: 6, alias: 'ip' },
    /**
     * @alias status
     * @description
     * OID for the status of the AP.
     * This OID is used with the MAC address of the AP by appending the decimal MAC address to the base OID.
     *
     * For example:
     * ```
     * apStatusBaseOid + '.<decMac>'
     * ```
     */
    apStatusBaseOid: {
      oid: '1.3.6.1.4.1.14179.2.2.1.1.6',
      index: 6,
      alias: 'status',
    },
    /**
     * @alias radio
     * @description
     * OID for the status of the radio.
     * This OID is used with the MAC address of the AP and radio index by appending the decimal MAC address and radio index to the base OID.
     *
     * For example:
     * ```
     * radioStatusBaseOid + '.<decMac>' + '.<radioIndex>'
     * ```
     */
    radioStatusBaseOid: {
      oid: '1.3.6.1.4.1.14179.2.2.2.1.12',
      index: 7,
      alias: 'radio',
    },
    /**
     * @alias band
     * @description
     * OID for the radio band (2.4, 5, 6 GHz).
     * This OID is used with the MAC address of the AP and radio index by appending the decimal MAC address and radio index to the base OID.
     *
     * For example:
     * ```
     * radioBandBaseOid + '.<decMac>' + '.<radioIndex>'
     * ```
     */
    radioBandBaseOid: {
      oid: '1.3.6.1.4.1.9.9.513.1.2.1.1.27',
      index: 7,
      alias: 'band',
    },
    /**
     * @alias channel
     * @description
     * OID for the channel.
     * This OID is used with the MAC address of the AP and radio index by appending the decimal MAC address and radio index to the base OID.
     *
     * For example:
     * ```
     * channelBaseOid + '.<decMac>' + '.<radioIndex>'
     * ```
     */
    channelBaseOid: {
      oid: '1.3.6.1.4.1.14179.2.2.2.1.4',
      index: 7,
      alias: 'channel',
    },
    /**
     * @alias ssid
     * @description
     * OID for the SSID name.
     * This OID is used with the ssid index by appending the ssid index to the base OID.
     *
     * For example:
     * ```
     * ssidNameBaseOid + '.<ssidIndex>'
     * ```
     */
    ssidNameBaseOid: {
      oid: '1.3.6.1.4.1.9.9.512.1.1.1.1.4',
      index: 1,
      alias: 'ssid',
    },
    /**
     * @alias ssidAP
     * @description
     * OID for the number of clients associated with SSIDs.
     * This OID is used with the ssid index by appending the ssid index to the base OID.
     *
     * For example:
     * ```
     * ssidNumBaseOid + '.<ssidIndex>'
     * ```
     */
    ssidNumBaseOid: {
      oid: '1.3.6.1.4.1.14179.2.1.1.1.38',
      index: 1,
      alias: 'ssidNum',
    },
    /**
     * @alias clientIp
     * @description
     * OID for the client IP address.
     * This OID is used with the MAC address of the client by appending the decimal MAC address to the base OID.
     *
     * For example:
     * ```
     * clientIpBaseOid + '.<decMac>'
     * ```
     */
    clientIpBaseOid: {
      oid: '1.3.6.1.4.1.14179.2.1.4.1.2',
      index: 6,
      alias: 'clientIp',
    },
    /**
     * @alias name
     * @description
     * OID for the AP name.
     * This OID is used with the MAC address of the AP by appending the decimal MAC address to the base OID.
     *
     * For example:
     * ```
     * apNameBaseOid + '.<decMac>'
     * ```
     */
    apNameBaseOid: {
      oid: '1.3.6.1.4.1.14179.2.2.1.1.3',
      index: 6,
      alias: 'name',
    },
    /**
     * @alias model
     * @description
     * OID for the AP model.
     * This OID is used with the MAC address of the AP by appending the decimal MAC address to the base OID.
     *
     * For example:
     * ```
     * apModelBaseOid + '.<decMac>'
     * ```
     */
    apModelBaseOid: {
      oid: '1.3.6.1.4.1.14179.2.2.1.1.16',
      index: 6,
      alias: 'model',
    },
    /**
     * @alias serial
     * @description
     * OID for the AP serial number.
     * This OID is used with the MAC address of the AP by appending the decimal MAC address to the base OID.
     *
     * For example:
     * ```
     * apSerialBaseOid + '.<decMac>'
     * ```
     */
    apSerialBaseOid: {
      oid: '1.3.6.1.4.1.14179.2.2.1.1.17',
      index: 6,
      alias: 'serial',
    },
    /**
     * @alias ios
     * @description
     * OID for the AP IOS version.
     * This OID is used with the MAC address of the AP by appending the decimal MAC address to the base OID.
     *
     * For example:
     * ```
     * apIosBaseOid + '.<decMac>'
     * ```
     */
    apIosBaseOid: {
      oid: '1.3.6.1.4.1.14179.2.2.1.1.31',
      index: 6,
      alias: 'ios',
    },
    /**
     * @alias ethMac
     * @description
     * OID for the AP Ethernet MAC address.
     * This OID is used with the MAC address of the AP by appending the decimal MAC address to the base OID.
     *
     * For example:
     * ```
     * apEthMacBaseOid + '.<decMac>'
     * ```
     */
    apEthMacBaseOid: {
      oid: '1.3.6.1.4.1.14179.2.2.1.1.33',
      index: 6,
      alias: 'ethMac',
    },
    /**
     * @alias radMac
     * @description
     * OID for the AP Radio MAC address.
     * This OID is used with the MAC address of the AP by appending the decimal MAC address to the base OID.
     *
     * For example:
     * ```
     * apRadMacBaseOid + '.<decMac>'
     * ```
     */
    apRadMacBaseOid: {
      oid: '1.3.6.1.4.1.14179.2.2.1.1.1',
      index: 6,
      alias: 'radMac',
    },
  },
  huawei: {
    /**
     * @alias client
     * @description
     * OID for the number of clients connected to the AP.
     * This OID is used with the MAC address and Radio index of the AP by appending the decimal MAC address and radio index to the base OID.
     *
     * For example:
     * ```
     * clientBaseOid + '.<decMac>' + '.<radioIndex>'
     * ```
     */
    clientBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.16.1.2.1.40',
      index: 7,
      alias: 'client',
    },
    /**
     * @alias rx
     * @description
     * OID for the number of RX rate (kbit/s).
     * This OID is used with the MAC address and Radio index of the AP by appending the decimal MAC address and radio index to the base OID.
     *
     * For example:
     * ```
     * rxBaseOid + '.<decMac>' + '.<radioIndex>'
     * ```
     */
    rxBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.16.1.2.1.32',
      index: 7,
      alias: 'rx',
    },
    /**
     * @alias tx
     * @description
     * OID for the number of TX rate (kbit/s).
     * This OID is used with the MAC address and Radio index of the AP by appending the decimal MAC address and radio index to the base OID.
     *
     * For example:
     * ```
     * txBaseOid + '.<decMac>' + '.<radioIndex>'
     * ```
     */
    txBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.16.1.2.1.37',
      index: 7,
      alias: 'tx',
    },
    /**
     * @alias ip
     * @description
     * OID for the IP address of the AP.
     * This OID is used with the MAC address of the AP by appending the decimal MAC address to the base OID.
     *
     * For example:
     * ```
     * ipBaseOid + '.<decMac>'
     * ```
     */
    ipBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.13.3.3.1.13',
      index: 6,
      alias: 'ip',
    },
    /**
     * @alias status
     * @description
     * OID for the status of the AP.
     * This OID is used with the MAC address of the AP by appending the decimal MAC address to the base OID.
     *
     * For example:
     * ```
     * apStatusBaseOid + '.<decMac>'
     * ```
     */
    apStatusBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.13.3.3.1.6',
      index: 6,
      alias: 'status',
    },
    /**
     * @alias radio
     * @description
     * OID for the status of the radio.
     * This OID is used with the MAC address and Radio index of the AP by appending the decimal MAC address and radio index to the base OID.
     *
     * For example:
     * ```
     * radioStatusBaseOid + '.<decMac>' + '.<radioIndex>'
     * ```
     */
    radioStatusBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.16.1.2.1.6',
      index: 7,
      alias: 'radio',
    },
    /**
     * @alias band
     * @description
     * OID for the radio band (2.4, 5, 6 GHz).
     * This OID is used with the MAC address and Radio index of the AP by appending the decimal MAC address and radio index to the base OID.
     *
     * For example:
     * ```
     * radioBandBaseOid + '.<decMac>' + '.<radioIndex>'
     * ```
     */
    radioBandBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.16.1.2.1.5',
      index: 7,
      alias: 'band',
    },
    /**
     * @alias channel
     * @description
     * OID for the channel.
     * This OID is used with the MAC address and Radio index of the AP by appending the decimal MAC address and radio index to the base OID.
     *
     * For example:
     * ```
     * channelBaseOid + '.<decMac>' + '.<radioIndex>'
     * ```
     */
    channelBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.16.1.2.1.7',
      index: 7,
      alias: 'channel',
    },
    /**
     * @alias ssid24G
     * @description
     * OID for counting clients associated with an SSID in the 2.4 GHz band.
     * This OID is used with the ssid name by appending the length of the SSID name and the SSID name (in ASCII code) to the base OID.
     *
     * Because the SSID name can vary in length, the index is considered variable-length.
     * In this context, we denote the index length as `-1` to indicate it is not fixed.
     *
     * For example:
     * ```
     * ssidNameBaseOid + '.<ssidNameLength>' + '.<ssidNameAscii>'
     *
     * example: SSID 'KUWIN' would be:
     * ssidNameBaseOid + '.5' + '.75.85.87.73.78'
     * ```
     */
    ssid24GBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.17.1.2.1.2',
      index: -1,
      alias: 'ssid24G',
    },
    /**
     * @alias ssid5G
     * @description
     * OID for counting clients associated with an SSID in the 5 GHz band.
     * This OID is used with the ssid name by appending the length of the SSID name and the SSID name (in ASCII code) to the base OID.
     *
     * Because the SSID name can vary in length, the index is considered variable-length.
     * In this context, we denote the index length as `-1` to indicate it is not fixed.
     *
     * For example:
     * ```
     * ssidNameBaseOid + '.<ssidNameLength>' + '.<ssidNameAscii>'
     *
     * example: SSID 'KUWIN' would be:
     * ssidNameBaseOid + '.5' + '.75.85.87.73.78'
     * ```
     */
    ssid5GBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.17.1.2.1.3',
      index: -1,
      alias: 'ssid5G',
    },
    /**
     * @alias ssid6G
     * @description
     * OID for counting clients associated with an SSID in the 6 GHz band.
     * This OID is used with the ssid name by appending the length of the SSID name and the SSID name (in ASCII code) to the base OID.
     *
     * Because the SSID name can vary in length, the index is considered variable-length.
     * In this context, we denote the index length as `-1` to indicate it is not fixed.
     *
     * For example:
     * ```
     * ssidNameBaseOid + '.<ssidNameLength>' + '.<ssidNameAscii>'
     *
     * example: SSID 'KUWIN' would be:
     * ssidNameBaseOid + '.5' + '.75.85.87.73.78'
     * ```
     */
    ssid6GBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.17.1.2.1.17',
      index: -1,
      alias: 'ssid6G',
    },
    // clientip
    /**
     * @alias name
     * @description
     * OID for the AP name.
     * This OID is used with the MAC address of the AP by appending the decimal MAC address to the base OID.
     *
     * For example:
     * ```
     * apNameBaseOid + '.<decMac>'
     * ```
     */
    apNameBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.13.3.3.1.4',
      index: 6,
      alias: 'name',
    },
    /**
     * @alias model
     * @description
     * OID for the AP model.
     * This OID is used with the MAC address of the AP by appending the decimal MAC address to the base OID.
     *
     * For example:
     * ```
     * apModelBaseOid + '.<decMac>'
     * ```
     */
    apModelBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.13.3.3.1.3',
      index: 6,
      alias: 'model',
    },
    /**
     * @alias serial
     * @description
     * OID for the AP serial number.
     * This OID is used with the MAC address of the AP by appending the decimal MAC address to the base OID.
     *
     * For example:
     * ```
     * apSerialBaseOid + '.<decMac>'
     * ```
     */
    apSerialBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.13.3.3.1.2',
      index: 6,
      alias: 'serial',
    },
    /**
     * @alias ios
     * @description
     * OID for the AP IOS version.
     * This OID is used with the MAC address of the AP by appending the decimal MAC address to the base OID.
     *
     * For example:
     * ```
     * apIosBaseOid + '.<decMac>'
     * ```
     */
    apIosBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.13.3.3.1.7',
      index: 6,
      alias: 'ios',
    },
    /**
     * @alias ethMac
     * @description
     * OID for the AP Ethernet MAC address.
     * This OID is used with the MAC address of the AP by appending the decimal MAC address to the base OID.
     *
     * For example:
     * ```
     * apEthMacBaseOid + '.<decMac>'
     * ```
     */
    apEthMacBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.13.3.3.1.39',
      index: 6,
      alias: 'ethMac',
    },
    /**
     * @alias radMac
     * @description
     * OID for the AP Radio MAC address.
     * This OID is used with the MAC address and Radio index of the AP by appending the decimal MAC address and radio index to the base OID.
     *
     * For example:
     * ```
     * apRadMacBaseOid + '.<decMac>' + '.<radioIndex>'
     * ```
     * */
    apRadMacBaseOid: {
      oid: '1.3.6.1.4.1.2011.6.139.16.1.2.1.20',
      index: 7,
      alias: 'radMac',
    },
  },
} as const;

const oidArray = Object.values(oids).flatMap((vendorOids) =>
  Object.values(vendorOids).map(
    ({ alias, oid, index }: { alias: string; oid: string; index: number }) => ({
      alias,
      oid: oid + '.',
      index,
    }),
  ),
);

type Vendor = keyof typeof oids;

type OidKey<T extends Vendor> = keyof (typeof oids)[T];

const metricsOid = [
  'clientBaseOid',
  'rxBaseOid',
  'txBaseOid',
  'ipBaseOid',
  'apStatusBaseOid',
  'radioStatusBaseOid',
  'radioBandBaseOid',
  'channelBaseOid',
] as const;

const ssidsOid: {
  [T in Vendor]: Array<OidKey<T>>;
} = {
  cisco: ['ssidNameBaseOid', 'ssidNumBaseOid'],
  huawei: ['ssid24GBaseOid', 'ssid5GBaseOid', 'ssid6GBaseOid'],
};

export { oids, oidArray, metricsOid, ssidsOid };

export type { Vendor, OidKey };
