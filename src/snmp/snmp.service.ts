import { InjectFlowProducer, InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FlowProducer, Queue } from 'bullmq';

@Injectable()
export class SnmpService {
  constructor(
    @InjectQueue('wlc-polling-queue') private readonly wlcPollingQueue: Queue,
    @InjectFlowProducer('wlc-polling-flow')
    private readonly flowProducer: FlowProducer,
  ) {}

  @Cron('*/5 * * * *')
  async getSnmp() {
    const wlcs = [
      // { name: 'wlc-1', host: '172.16.26.10' },
      { name: 'wlc-2', host: '172.16.26.12' },
      // { name: 'wlc-3', host: '172.16.26.16' },
      { name: 'wlc-4', host: '172.16.26.11' },
    ];
    // const oids = [
    //   'oid-1',
    //   'oid-2',
    //   'oid-3',
    //   'oid-4',
    //   'oid-5',
    //   'oid-6',
    //   'oid-7',
    //   'oid-8',
    // ];
    const oidClient = '1.3.6.1.4.1.14179.2.2.2.1.15'; // No. of clients connected to AP
    const oidRx = '1.3.6.1.4.1.9.9.513.1.2.2.1.13'; // Rx bytes
    const oidTx = '1.3.6.1.4.1.9.9.513.1.2.2.1.14'; // Tx bytes
    const oids = [oidClient, oidRx, oidTx];
    // await this.wlcPollingQueue.addBulk(
    //   wlcs.map((wlc) => ({
    //     name: 'wlc',
    //     data: {
    //       data: `This is a test job for SNMP polling on WLC ${wlc.host}`,
    //       wlcName: wlc.name,
    //       wlcHost: wlc.host,
    //       oids,
    //     },
    //   })),
    // );
    await this.flowProducer.addBulk(
      wlcs.map((wlc) => ({
        name: 'wlc-polling-job',
        queueName: 'wlc-polling-queue',
        data: {
          data: `WLC polling on Host ${wlc.host}`,
          wlcName: wlc.name,
        },
        children: oids.map((oid) => ({
          name: 'oid-polling-job',
          data: {
            data: `SNMP polling on WLC ${wlc.host} for OID ${oid}`,
            wlcHost: wlc.host,
            oid,
          },
          queueName: `oid-polling-queue-${wlc.name}`,
          opts: {
            // continueParentOnFailure: true,
            removeOnComplete: { age: 180, count: 100 },
            removeOnFail: { age: 180, count: 100 },
            ignoreDependencyOnFailure: true,
          },
        })),
        opts: {
          removeOnComplete: { age: 180, count: 100 },
          removeOnFail: { age: 180, count: 100 },
        },
      })),
    );
    console.log({ message: 'SNMP polling jobs added to the queue!' });
  }
}
