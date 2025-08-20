import { Lifecycle } from '../../lifecycles/entities/lifecycle.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('model')
export class Model {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { name: 'model', nullable: false, length: 50 })
  model: string;

  @Column('varchar', {
    name: 'pic',
    nullable: true,
    length: 100,
    default: 'underconstruction.gif',
  })
  pic: string | null;

  @ManyToOne(() => Lifecycle, (lifecycle) => lifecycle.models, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    nullable: true,
  })
  lifecycle: Lifecycle;
}
