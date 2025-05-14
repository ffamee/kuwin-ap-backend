import {
  Entity as EntityDecorator,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Entity } from '../../entities/entities/entity.entity';

@EntityDecorator('section')
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    name: 'sec_type',
    length: 30,
    nullable: false,
    unique: true,
  })
  secType: string;

  @OneToMany(() => Entity, (entity) => entity.section)
  entities: Entity[];
}
