const wlcs = [
  // { name: 'wlc-1', host: '172.16.26.10', vendor: 'cisco' },
  { name: 'wlc-2', host: '172.16.26.12', vendor: 'cisco' },
  { name: 'wlc-3', host: '172.16.26.16', vendor: 'huawei' },
  { name: 'wlc-4', host: '172.16.26.11', vendor: 'cisco' },
] as const;

const ssidWatchList = ['KUWIN', 'KUWIN-IOT', 'eduroam'] as const;

export { wlcs, ssidWatchList };
