import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('currencies')
@Unique(['date', 'price'])
export class CurrenciesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  couple: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'float' })
  price: number;
}
