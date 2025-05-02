import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', {
    name: 'username',
    length: 100,
    default: '',
    unique: true,
  })
  username: string;

  @Column('varchar', { name: 'password', length: 255, nullable: false })
  password: string;

  @Column('smallint', {
    name: 'Privilege',
    unsigned: true,
    default: 0,
  })
  privilege: number;
}
