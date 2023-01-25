import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Categories } from './categories';
import { TelegramUsers } from './telegram_users';

@Entity()
export class Costs {
  @PrimaryGeneratedColumn('increment')
  cost_id: number;

  @Column({ type: 'date' })
  date: string;

  @Column()
  expense_sum: number;

  @ManyToOne(() => Categories, (category) => category.category_id)
  expense_id: number;

  @ManyToOne(() => TelegramUsers, (users) => users.telegram_id)
  telegram_user_id: number;
}
