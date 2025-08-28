import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Model } from '../../models/entities/model.entity';

@Entity('lifecycle')
export class Lifecycle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { name: 'group', nullable: false, length: 50 })
  group: string;

  @Column({
    name: 'end_of_life',
    type: 'date',
    nullable: true,
    default: null,
  })
  eol: Date | null;

  @Column({
    name: 'end_of_service',
    type: 'date',
    nullable: true,
    default: null,
  })
  eos: Date | null;

  @Column('varchar', {
    name: 'pic',
    nullable: true,
    length: 100,
    default: 'default.png',
  })
  pic: string | null;

  @OneToMany(() => Model, (model) => model.lifecycle)
  models: Model[];
}
