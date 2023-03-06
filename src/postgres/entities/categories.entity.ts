import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CostsEntity } from './costs.entity';

@Entity('categories')
export class CategoriesEntity {
  @PrimaryGeneratedColumn('increment')
  @OneToMany(() => CostsEntity, (costs: CostsEntity) => costs.cost_id)
  category_id: number;

  @Column({ unique: true })
  category: string;

  @Column({ unique: true })
  category_en: string;
}
