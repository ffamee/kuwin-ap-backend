import { Module, OnModuleInit } from '@nestjs/common';
import { SnmpService } from './snmp.service';
import { SnmpController } from './snmp.controller';
import { BullModule, BullRegistrar } from '@nestjs/bullmq';
import { WlcPollingProcessor } from './snmp.processor';
import { OidModule } from '../oid/oid.module';
import { InfluxModule } from '../influx/influx.module';
import { ConfigurationsModule } from '../configurations/configurations.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'wlc-polling-queue' }),
    BullModule.registerFlowProducer({ name: 'wlc-polling-flow' }),
    OidModule,
    InfluxModule,
    ConfigurationsModule,
  ],
  providers: [SnmpService, WlcPollingProcessor],
  controllers: [SnmpController],
  exports: [SnmpService],
})
export class SnmpModule implements OnModuleInit {
  constructor(private bullRegistrar: BullRegistrar) {}

  onModuleInit() {
    this.bullRegistrar.register();
  }
}
