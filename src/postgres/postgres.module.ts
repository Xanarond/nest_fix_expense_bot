import { Module } from '@nestjs/common';
import { PostgresService } from './postgres.service';
import { CurrenciesModule } from '../currencies/currencies.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currencies } from './entities/currencies';
import { TelegramUsers } from './entities/telegram_users';
import { Categories } from './entities/categories';
import { Costs } from './entities/costs';
import { Budgets } from './entities/budgets';

@Module({
  imports: [
    CurrenciesModule,
    TypeOrmModule.forFeature([
      Currencies,
      TelegramUsers,
      Categories,
      Costs,
      Budgets,
    ]),
  ],
  providers: [PostgresService],
  exports: [PostgresService],
})
export class PostgresModule {}
