import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { TelegramUser } from './telegram_users.entity';

@Entity('budgets')
@Unique(['currency'])
export class BudgetsEntity {
  @PrimaryGeneratedColumn('increment')
  budget_id: number;
  @Column()
  currency: string;
  @Column({ type: 'float' })
  count: string;

  @ManyToOne(() => TelegramUser, (users: TelegramUser) => users.telegram_id)
  belong: number;
}
