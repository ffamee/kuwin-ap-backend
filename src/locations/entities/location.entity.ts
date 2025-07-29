import { History } from '../../histories/entities/history.entity';
import { Building } from '../../buildings/entities/building.entity';
import { Configuration } from '../../configurations/entities/configuration.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity('location')
@Index(['name', 'building'], { unique: true })
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    name: 'location_name',
    length: 200,
    nullable: false,
  })
  name: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => Building, (building) => building.locations, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  building: Building;

  @OneToMany(() => History, (history) => history.location)
  histories: History[];

  @OneToOne(() => Configuration, (configuration) => configuration.location, {
    nullable: true,
    orphanedRowAction: 'nullify',
  })
  configuration: Configuration | null;
}
