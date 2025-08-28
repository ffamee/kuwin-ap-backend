import { Lifecycle } from '../../lifecycles/entities/lifecycle.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('model')
export class Model {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { name: 'model', nullable: false, length: 50 })
  model: string;

  @ManyToOne(() => Lifecycle, (lifecycle) => lifecycle.models, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  lifecycle: Lifecycle;
}
