import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TelegramUsers } from './telegram_users';

@Entity()
export class Budgets {
  @PrimaryGeneratedColumn('increment')
  budget_id: number;
  @Column()
  currency: string;
  @Column()
  count: number;

  @ManyToOne(() => TelegramUsers, (users) => users.telegram_id)
  belong: number;
}
