import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
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
