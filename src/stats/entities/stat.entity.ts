import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('stat')
export class Stat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'ap_id', unsigned: true })
  apId: number;

  @Column('int', { unsigned: true })
  year: number;

  @Column('int', { unsigned: true })
  month: number;

  @Column('bigint', { unsigned: true })
  uptime: string;

  @Column('bigint', { unsigned: true })
  downtime: string;

  @Column('bigint', { unsigned: true })
  totaltime: string;
}
