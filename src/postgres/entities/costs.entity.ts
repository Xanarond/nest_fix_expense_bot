import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CategoriesEntity } from './categories.entity';
import { TelegramUsers } from './telegram_users.entity';
import { BudgetsEntity } from './budgets.entity';

@Entity('costs')
export class CostsEntity {
  @PrimaryGeneratedColumn('increment')
  cost_id: number;

  @Column({ type: 'date' })
  date: string;

  @Column()
  expense_sum: number;

  @ManyToOne(() => BudgetsEntity, (budget: BudgetsEntity) => budget.currency)
  currency: string;

  @ManyToOne(
    () => CategoriesEntity,
    (category: CategoriesEntity) => category.category_id,
  )
  expense_id: number;

  @ManyToOne(() => TelegramUsers, (users: TelegramUsers) => users.telegram_id)
  telegram_user_id: number;
}
