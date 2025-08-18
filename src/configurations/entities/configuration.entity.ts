import { Location } from '../../locations/entities/location.entity';
import { Accesspoint } from '../../accesspoints/entities/accesspoint.entity';
import { Ip } from '../../ip/entities/ip.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  // UpdateDateColumn,
} from 'typeorm';
import { StatusState } from '../../shared/types/define-state';

@Entity('configuration')
export class Configuration {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  // @UpdateDateColumn({
  //   name: 'last_seen_at',
  // })
  @Column('datetime', {
    name: 'last_seen_at',
    nullable: false,
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  lastSeenAt: Date;

  @Column('varchar', {
    name: 'mismatch_reason',
    length: 31,
    nullable: true,
    default: null,
  })
  mismatchReason: string | null;

  @Column('text', {
    name: 'problem',
    nullable: true,
    default: null,
  })
  problem: string | null;

  @Column('bigint', {
    name: 'tx',
    nullable: true,
    unsigned: true,
    default: null,
  })
  tx: bigint | null;

  @Column('bigint', {
    name: 'rx',
    nullable: true,
    unsigned: true,
    default: null,
  })
  rx: bigint | null;

  @Column('int', {
    name: 'client_24',
    nullable: true,
    unsigned: true,
    default: null,
  })
  client24: number | null;

  @Column('int', {
    name: 'client_5',
    nullable: true,
    unsigned: true,
    default: null,
  })
  client5: number | null;

  @Column('int', {
    name: 'client_6',
    nullable: true,
    unsigned: true,
    default: null,
  })
  client6: number | null;

  @Column('int', {
    name: 'channel',
    nullable: true,
    unsigned: true,
    default: null,
  })
  channel: number | null;

  @Column('int', {
    name: 'channel_2',
    nullable: true,
    unsigned: true,
    default: null,
  })
  channel2: number | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: StatusState,
    default: StatusState.Pending,
    nullable: false,
  })
  status: StatusState;

  @Column('varchar', {
    name: 'wlc',
    length: 20,
    nullable: true,
    default: null,
  })
  wlc: string | null;

  @OneToOne(() => Accesspoint, (accesspoint) => accesspoint.configuration, {
    cascade: ['insert'],
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  accesspoint: Accesspoint;

  @OneToOne(() => Ip, (ip) => ip.configuration, {
    cascade: ['insert'],
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  ip: Ip;

  @OneToOne(() => Location, (location) => location.configuration, {
    cascade: ['insert'],
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  location: Location;
}
