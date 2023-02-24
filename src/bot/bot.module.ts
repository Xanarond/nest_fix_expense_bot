import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import * as LocalSession from 'telegraf-session-local';
import { TelegrafModule } from 'nestjs-telegraf';
import { PostgresModule } from '../postgres/postgres.module';
import { CurrenciesSum } from './scenes/currencies_sum.scene';
import { ExpensesScene } from './scenes/expenses.scene';
import { BudgetScene } from './scenes/budget.scene';

const sessions = new LocalSession({ database: 'session.json' });

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        token: process.env.BOT_TOKEN,
        middlewares: [sessions.middleware()],
      }),
    }),
    PostgresModule,
  ],
  providers: [BotService, ExpensesScene, CurrenciesSum, BudgetScene],
})
export class BotModule {}
