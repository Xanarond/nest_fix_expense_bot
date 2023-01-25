import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Costs } from './costs';

@Entity()
@Unique(['category'])
export class Categories {
  @PrimaryGeneratedColumn('increment')
  @OneToMany(() => Costs, (costs) => costs.cost_id)
  category_id: number;

  @Column()
  category: string;
}
