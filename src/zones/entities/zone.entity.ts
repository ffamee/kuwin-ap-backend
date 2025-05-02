import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('zone')
export class Zone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, type: 'text' })
  area: string;

  @Column({ nullable: false, type: 'text' })
  picture: string;

  @Column({ unique: true, type: 'decimal', precision: 9, scale: 6 })
  latitude: number;

  @Column({ unique: true, type: 'decimal', precision: 9, scale: 6 })
  longitude: number;

  @Column({ nullable: true, default: null, type: 'text' })
  comment: string;
}
