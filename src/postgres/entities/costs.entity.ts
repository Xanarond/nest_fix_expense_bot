import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CategoriesEntity } from './categories.entity';
import { TelegramUser } from './telegram_users.entity';

@Entity('costs')
export class CostsEntity {
  @PrimaryGeneratedColumn('increment')
  cost_id: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'float' })
  expense_sum: number;

  @Column()
  currency: string;

  @ManyToOne(
    () => CategoriesEntity,
    (category: CategoriesEntity) => category.category_id,
  )
  expense_id: number;

  @ManyToOne(() => TelegramUser, (users: TelegramUser) => users.telegram_id)
  telegram_user_id: number;
}
