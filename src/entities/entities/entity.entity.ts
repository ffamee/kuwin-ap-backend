import {
  Column,
  Entity as EntityDecorator,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Section } from '../../section/entities/section.entity';

@EntityDecorator('entity')
export class Entity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', length: 100, nullable: false })
  name: string;

  @Column('bigint', { name: 'num_ap', unsigned: true, default: 0 })
  numAp: string;

  @Column('bigint', { name: 'num_cl', unsigned: true, default: 0 })
  numCl: string;

  @Column('double', {
    name: 'cl_avg',
    unsigned: true,
    precision: 5,
    scale: 2,
    default: 0.0,
  })
  clAvg: number;

  @Column('bigint', { name: 'cl_max', unsigned: true, default: 0 })
  clMax: string;

  @Column('varchar', { name: 'timestamp', length: 100, default: '' })
  timestamp: string;

  @Column('bigint', { name: 'sum_cl', unsigned: true, default: 0 })
  sumCl: string;

  @Column('int', { name: 'zone', unsigned: true, default: 0 })
  zone: number;

  @Column('text', { name: 'url' })
  url: string;

  @Column('text', { name: 'coordinate' })
  coordinate: string;

  @Column('text', { name: 'style' })
  style: string;

  @Column('varchar', {
    name: 'pic',
    length: 50,
    default: './picMap/underconstruction.gif',
  })
  pic: string;

  @Column('int', { name: 'sec_type_id' })
  secId: number;

  @ManyToOne(() => Section, (section) => section.entities, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'sec_type_id' })
  section: Section;
}
