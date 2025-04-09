import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Zone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, type: 'text' })
  area: string;

  @Column({ nullable: false })
  picture: string;

  @Column({ unique: true, type: 'decimal', precision: 9, scale: 6 })
  latitude: number;

  @Column({ unique: true, type: 'decimal', precision: 9, scale: 6 })
  longtitude: number;

  @Column({ nullable: true, default: null, type: 'text' })
  comment: string;
}
