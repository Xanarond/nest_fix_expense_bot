import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { TelegramUsers } from './telegram_users.entity';

@Entity('budgets')
@Unique(['currency'])
export class BudgetsEntity {
  @PrimaryGeneratedColumn('increment')
  budget_id: number;
  @Column()
  currency: string;
  @Column({ type: 'float' })
  count: number;

  @ManyToOne(() => TelegramUsers, (users) => users.telegram_id)
  belong: number;
}
