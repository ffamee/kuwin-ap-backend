import { Location } from '../../locations/entities/location.entity';
import { Accesspoint } from '../../accesspoints/entities/accesspoint.entity';
import { Ip } from '../../ip/entities/ip.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('history')
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', {
    name: 'comment',
    nullable: true,
  })
  comment: string | null;

  @Column('int', {
    name: 'config_id',
    nullable: false,
    unique: true,
  })
  configId: number;

  @Column('datetime', {
    name: 'started_at',
    precision: 6,
    nullable: false,
  })
  startedAt: Date;

  @CreateDateColumn({
    name: 'ended_at',
  })
  endedAt: Date;

  @ManyToOne(() => Accesspoint, (accesspoint) => accesspoint.histories, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  accesspoint: Accesspoint;

  @ManyToOne(() => Ip, (ip) => ip.histories, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  ip: Ip;

  @ManyToOne(() => Location, (location) => location.histories, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  location: Location;
}
