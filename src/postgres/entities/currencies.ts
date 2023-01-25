import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['date', 'price'])
export class Currencies {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  couple: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'float' })
  price: number;
}
