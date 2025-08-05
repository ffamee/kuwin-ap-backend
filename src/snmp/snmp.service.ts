import { InjectFlowProducer, InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FlowProducer, Queue, QueueEvents } from 'bullmq';

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
      { name: 'wlc-1', host: '172.16.26.10' },
      { name: 'wlc-2', host: '172.16.26.12' },
      // { name: 'wlc-3', host: '172.16.26.16' },
      { name: 'wlc-4', host: '172.16.26.11' },
    ];
    const oidClient = '1.3.6.1.4.1.14179.2.2.2.1.15'; // No. of clients connected to AP
    const oidRx = '1.3.6.1.4.1.9.9.513.1.2.2.1.13'; // Rx bytes
    const oidTx = '1.3.6.1.4.1.9.9.513.1.2.2.1.14'; // Tx bytes
    const oidIp = '1.3.6.1.4.1.14179.2.2.1.1.19'; // IP address of AP
    const oidAPStatus = '1.3.6.1.4.1.14179.2.2.1.1.6';
    const oidRadioStatus = '1.3.6.1.4.1.14179.2.2.2.1.12';
    const oidRadioBand = '1.3.6.1.4.1.9.9.513.1.2.1.1.27';
    const oidChannel = '1.3.6.1.4.1.14179.2.2.2.1.4'; // Channel of the AP
    const metricOids = [
      oidClient,
      oidRx,
      oidTx,
      oidIp,
      oidAPStatus,
      oidRadioStatus,
      oidRadioBand,
      oidChannel,
    ];
    const oidSSIDName = '1.3.6.1.4.1.9.9.512.1.1.1.1.4';
    const oidSSIDNum = '1.3.6.1.4.1.14179.2.1.1.1.38';
    const ssidOids = [oidSSIDName, oidSSIDNum];
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
    console.time('SNMP polling jobs processing time');
    const metricJobs = await this.flowProducer.addBulk(
      wlcs.map((wlc) => ({
        name: 'metric-polling-job',
        queueName: 'wlc-polling-queue',
        data: {
          data: `WLC polling on Host ${wlc.host}`,
          wlcHost: wlc.host,
          wlcName: wlc.name,
        },
        children: metricOids.map((oid) => ({
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
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000, // 1 second
            },
          },
        })),
        opts: {
          removeOnComplete: { age: 180, count: 100 },
          removeOnFail: { age: 180, count: 100 },
        },
      })),
    );
    const ssidJobs = await this.flowProducer.addBulk(
      wlcs.map((wlc) => ({
        name: 'ssid-polling-job',
        queueName: 'wlc-polling-queue',
        data: {
          data: `SSID polling on Host ${wlc.host}`,
          wlcName: wlc.name,
        },
        children: ssidOids.map((oid) => ({
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
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000, // 1 second
            },
          },
        })),
        opts: {
          removeOnComplete: { age: 180, count: 100 },
          removeOnFail: { age: 180, count: 100 },
        },
      })),
    );
    const queueEvent = new QueueEvents('wlc-polling-queue');
    await Promise.all(
      metricJobs.map((job) => job.job.waitUntilFinished(queueEvent)),
    );
    console.timeLog('SNMP polling jobs processing time', 'Done metrics jobs');
    await Promise.all(
      ssidJobs.map((job) => job.job.waitUntilFinished(queueEvent)),
    );
    console.timeEnd('SNMP polling jobs processing time');
  }
}
