import { History } from '../../histories/entities/history.entity';
import { Configuration } from '../../configurations/entities/configuration.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  // UpdateDateColumn,
} from 'typeorm';

@Entity('accesspoint')
export class Accesspoint {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column('int', { name: 'B_ID', unsigned: true, default: 0 })
  // buildingId: number;

  // @Column('varchar', {
  //   name: 'Status',
  //   nullable: true,
  //   length: 8,
  //   default: 'down',
  // })
  // @Index('Status', { fulltext: true })
  // status: string | null;

  // @Column('varchar', { name: 'IP', nullable: true, length: 16 })
  // ip: string | null;

  @Column('varchar', {
    name: 'radMac',
    nullable: false,
    length: 20,
    unique: true,
  })
  radMac: string;

  @Column('varchar', {
    name: 'ethMac',
    nullable: false,
    length: 20,
    unique: true,
  })
  ethMac: string;

  @Column('varchar', { name: 'name', nullable: false, length: 100 })
  name: string;

  // @Column('varchar', { name: 'Location', nullable: true, length: 150 })
  // @Index('Location')
  // location: string | null;

  // @Column('int', { name: 'Number_client', nullable: false, default: 0 })
  // numberClient: number;

  // @Column('bigint', { name: 'RXBS', nullable: true, unsigned: true })
  // rxbs: number | null;

  // @Column('bigint', { name: 'TXBS', nullable: true, unsigned: true })
  // txbs: number | null;

  // @Column('varchar', { name: 'zone', nullable: true, length: 100, default: '' })
  // zone: string | null;

  // @Column('int', {
  //   name: 'IQD',
  //   nullable: true,
  //   unsigned: true,
  //   default: 0,
  // })
  // iqd: number | null;

  // @Column('int', {
  //   name: 'OQD',
  //   nullable: true,
  //   unsigned: true,
  //   default: 0,
  // })
  // oqd: number | null;

  // @Column('int', {
  //   name: 'channel',
  //   nullable: true,
  //   unsigned: true,
  //   default: 0,
  // })
  // channel: number | null;

  // @Column('varchar', {
  //   name: 'Switch_IP',
  //   nullable: true,
  //   length: 16,
  //   default: '0',
  // })
  // switchIp: string | null;

  @Column('varchar', { name: 'model', nullable: false, length: 100 })
  @Index()
  model: string;

  @Column('varchar', {
    name: 'ios',
    nullable: false,
    length: 100,
    default: '0',
  })
  ios: string;

  // @Column('int', { name: 'fac_id', unsigned: true, default: 0 })
  // facId: number;

  // @Column('int', { name: 'cl_max', unsigned: true, default: 0 })
  // clMax: number;

  // @Column('decimal', {
  //   name: 'cl_avg',
  //   precision: 5,
  //   scale: 2,
  //   default: 0.0,
  // })
  // clAvg: string;

  // @Column('varchar', { name: 'timestamp', length: 100, default: '0' })
  // timestamp: string;

  // @Column('varchar', {
  //   name: 'sum_cl',
  //   length: 100,
  //   default: '',
  // })
  // sumCl: string;

  @Column('varchar', {
    name: 'serial',
    nullable: false,
    length: 100,
  })
  serial: string;

  @Column('varchar', {
    name: 'pic',
    length: 100,
    default: 'underconstruction.gif',
  })
  pic: string;

  // @Column('tinyint', { name: 'grpBW', unsigned: true, default: 0 })
  // grpBw: number;

  // @Column('tinyint', {
  //   name: 'grpMAN',
  //   nullable: true,
  //   unsigned: true,
  //   default: 0,
  // })
  // grpMan: number | null;

  // @Column('varchar', { name: 'latitude', length: 25 })
  // latitude: string;

  // @Column('varchar', { name: 'longtitude', length: 25 })
  // longtitude: string;

  // @Column('int', {
  //   name: 'Switch_Port_ID',
  //   nullable: true,
  //   default: 0,
  // })
  // switchPortId: number | null;

  // @Column('datetime', { name: 'install_time', nullable: true })
  // installTime: Date | null;

  // @Column('datetime', { name: 'downtime_start', nullable: true })
  // downtimeStart: Date | null;

  // @Column('int', { name: 'MA_ID', nullable: true, default: 1 })
  // maId: number | null;

  // @Column('char', {
  //   name: 'job_status',
  //   nullable: true,
  //   length: 20,
  //   default: 'No',
  // })
  // jobStatus: string | null;

  // @Column('bigint', { name: 'timestamp2', unsigned: true })
  // timestamp2: number;

  // @Column('int', { name: 'CRXBS', nullable: true, unsigned: true })
  // crxbs: number | null;

  // @Column('int', { name: 'CTXBS', nullable: true, unsigned: true })
  // ctxbs: number | null;

  // @Column('enum', { name: 'WLC', enum: ['Yes', 'No'], default: 'No' })
  // wlc: 'Yes' | 'No';

  // @Column('varchar', { name: 'problem', nullable: true, length: 150 })
  // problem: string | null;

  // @Column('int', { name: 'channel_2' })
  // channel_2: number;

  // @Column('int', { name: 'Number_client_2', nullable: false, default: 0 })
  // numberClient_2: number;

  // @Column('int', { name: 'cl_max_2' })
  // clMax_2: number;

  // @Column('varchar', { name: 'WLC_active', length: 25 })
  // wlcActive: string;

  @Column('varchar', { name: 'owner', nullable: true, length: 100 })
  owner: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // @UpdateDateColumn({ name: 'updated_at' })
  @Column('datetime', {
    name: 'updated_at',
    nullable: false,
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  // @ManyToOne(() => Building, (building) => building.accesspoints, {
  //   onDelete: 'RESTRICT',
  //   onUpdate: 'CASCADE',
  // })
  // building: Building;

  @OneToMany(() => History, (history) => history.accesspoint)
  histories: History[];

  @OneToOne(() => Configuration, (configuration) => configuration.accesspoint, {
    nullable: true,
    orphanedRowAction: 'nullify',
  })
  configuration: Configuration | null;
}
