import { Column, Entity, OneToMany, PrimaryColumn, Unique } from 'typeorm';
import { CostsEntity } from './costs.entity';

@Entity('telegram_users')
@Unique(['telegram_id'])
export class TelegramUser {
  @PrimaryColumn({ type: 'bigint' })
  @OneToMany(() => CostsEntity, (costs: CostsEntity) => costs.telegram_user_id)
  telegram_id: number;

  @Column()
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column()
  username: string;

  @Column()
  language: string;

  @Column()
  is_premium: boolean;
}
