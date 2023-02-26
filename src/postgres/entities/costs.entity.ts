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

  @Column()
  currency: string;

  @ManyToOne(
    () => CategoriesEntity,
    (category: CategoriesEntity) => category.category_id,
  )
  expense_id: number;

  @ManyToOne(() => TelegramUsers, (users: TelegramUsers) => users.telegram_id)
  telegram_user_id: number;
}
