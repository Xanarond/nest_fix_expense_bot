import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CostsEntity } from './costs.entity';

@Entity('categories')
@Unique(['category'])
export class CategoriesEntity {
  @PrimaryGeneratedColumn('increment')
  @OneToMany(() => CostsEntity, (costs: CostsEntity) => costs.cost_id)
  category_id: number;

  @Column()
  category: string;
}
