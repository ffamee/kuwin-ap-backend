import {
  Entity as EntityDecorator,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  // UpdateDateColumn,
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
  name: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  // @UpdateDateColumn({
  //   name: 'updated_at',
  // })
  @Column('datetime', {
    name: 'updated_at',
    nullable: false,
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @OneToMany(() => Entity, (entity) => entity.section)
  entities: Entity[];
}
