import { Module } from '@nestjs/common';
import { PostgresService } from './postgres.service';
import { CurrenciesModule } from '../currencies/currencies.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrenciesEntity } from './entities/currencies.entity';
import { TelegramUsers } from './entities/telegram_users.entity';
import { CategoriesEntity } from './entities/categories.entity';
import { CostsEntity } from './entities/costs.entity';
import { BudgetsEntity } from './entities/budgets.entity';

@Module({
  imports: [
    CurrenciesModule,
    TypeOrmModule.forFeature([
      CurrenciesEntity,
      TelegramUsers,
      CategoriesEntity,
      CostsEntity,
      BudgetsEntity,
    ]),
  ],
  providers: [PostgresService],
  exports: [PostgresService],
})
export class PostgresModule {}
