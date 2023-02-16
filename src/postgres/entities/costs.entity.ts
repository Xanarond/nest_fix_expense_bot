import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CategoriesEntity } from './categories.entity';
import { TelegramUsers } from './telegram_users.entity';

@Entity('costs')
export class CostsEntity {
  @PrimaryGeneratedColumn('increment')
  cost_id: number;

  @Column({ type: 'date' })
  date: string;

  @Column()
  expense_sum: number;

  @ManyToOne(() => CategoriesEntity, (category) => category.category_id)
  expense_id: number;

  @ManyToOne(() => TelegramUsers, (users) => users.telegram_id)
  telegram_user_id: number;
}
