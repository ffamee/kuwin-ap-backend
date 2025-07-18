import {
  Column,
  Entity as TypeOrmEntity,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Entity } from '../../entities/entities/entity.entity';
import { Accesspoint } from '../../accesspoints/entities/accesspoint.entity';
import { Location } from '../../locations/entities/location.entity';

@TypeOrmEntity('building')
export class Building {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('smallint', { name: 'ID_F', unsigned: true, default: 0 })
  idF: number;

  @Column('smallint', { name: 'ID_Z', unsigned: true, default: 0 })
  idZ: number;

  @Column('text', { name: 'name' })
  name: string;

  @Column('varchar', {
    name: 'pic',
    nullable: true,
    length: 100,
    default: 'underconstruction.gif',
  })
  pic: string | null;

  @Column('text', { name: 'comment', nullable: true })
  comment: string | null;

  @Column('varchar', { name: 'latitude', nullable: true, length: 25 })
  latitude: string | null;

  @Column('varchar', { name: 'longtitude', nullable: true, length: 25 })
  longtitude: string | null;

  @Column('int', { name: 'code_id', unsigned: true, default: 0 })
  codeId: number;

  @ManyToOne(() => Entity, (entity) => entity.buildings, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  entity: Entity;

  @OneToMany(() => Accesspoint, (accesspoint) => accesspoint.building)
  accesspoints: Accesspoint[];

  @OneToMany(() => Location, (location) => location.building)
  locations: Location[];
}
