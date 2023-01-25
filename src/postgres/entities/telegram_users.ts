import { Column, Entity, OneToMany, PrimaryColumn, Unique } from 'typeorm';
import { Costs } from './costs';

@Entity()
@Unique(['telegram_id'])
export class TelegramUsers {
  @PrimaryColumn({ type: 'bigint' })
  @OneToMany(() => Costs, (costs) => costs.telegram_user_id)
  telegram_id: number;

  @Column()
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column()
  username: string;

  @Column()
  is_premium: boolean;
}
