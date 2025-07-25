import { Configuration } from '../../configurations/entities/configuration.entity';
import { History } from '../../histories/entities/history.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  // ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity('ip')
@Index(['ip'], { unique: true })
export class Ip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    name: 'ip_address',
    length: 31,
    nullable: false,
  })
  ip: string;

  @Column('bigint', {
    name: 'ip_number',
    unsigned: true,
    nullable: false,
    unique: true,
  })
  ipNumber: number; // or bigint, depending on your database

  @Column('varbinary', {
    name: 'ip_binary',
    length: 128,
    nullable: false,
    unique: true,
  })
  ipBinary: Buffer;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  // type tinyint, name subnet mask
  // @Column('tinyint', { name: 'subnet_mask', unsigned: true, nullable: false })
  // subnetMask: number; // or tinyint, depending on your database

  // @ManyToOne(() => Entity, (entity) => entity.buildings, {
  //   onDelete: 'RESTRICT',
  //   onUpdate: 'CASCADE',
  // })
  // entity: Entity;

  // @OneToMany(() => Accesspoint, (accesspoint) => accesspoint.building)
  // accesspoints: Accesspoint[];

  @OneToMany(() => History, (history) => history.ip)
  histories: History[];

  @OneToOne(() => Configuration, (configuration) => configuration.accesspoint, {
    nullable: true,
    orphanedRowAction: 'nullify',
  })
  configuration: Configuration | null;
}
