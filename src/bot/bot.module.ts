import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import * as LocalSession from 'telegraf-session-local';
import { TelegrafModule } from 'nestjs-telegraf';
import { PostgresModule } from '../postgres/postgres.module';
import { CurrenciesSum } from './classes/currencies_sum';
import { Expenses } from './classes/expenses';

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
  providers: [BotService, Expenses, CurrenciesSum],
})
export class BotModule {}
