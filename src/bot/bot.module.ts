import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import * as LocalSession from 'telegraf-session-local';
import { TelegrafModule } from 'nestjs-telegraf';
import { CurrenciesSum } from './classes/currencies_sum';
import { PostgresModule } from '../postgres/postgres.module';
import { Expenses } from './classes/expenses';
import { Budget } from './classes/budget';

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
  providers: [BotService, Budget, Expenses, CurrenciesSum],
})
export class BotModule {}
