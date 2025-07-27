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
  UpdateDateColumn,
} from 'typeorm';
import { ConfigState, StatusState } from '../../shared/types/define-state';

@Entity('configuration')
export class Configuration {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'last_seen_at',
  })
  lastSeenAt: Date;

  @Column({
    name: 'state',
    type: 'enum',
    enum: ConfigState,
    default: ConfigState.Pending,
  })
  state: ConfigState;

  @Column('bigint', {
    name: 'tx',
    nullable: true,
    unsigned: true,
    default: null,
  })
  tx: number | null;

  @Column('bigint', {
    name: 'rx',
    nullable: true,
    unsigned: true,
    default: null,
  })
  rx: number | null;

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

  @Column({
    name: 'status',
    type: 'enum',
    enum: StatusState,
    default: null,
    nullable: true,
  })
  status: StatusState | null;

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
