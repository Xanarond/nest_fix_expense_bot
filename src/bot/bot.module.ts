import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import * as LocalSession from 'telegraf-session-local';
import { TelegrafModule } from 'nestjs-telegraf';
import { CurrenciesModule } from '../currencies/currencies.module';
import { CurrencySum } from "./classes/currency_sum";


const sessions = new LocalSession({ database: 'session.json' });
@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        token: process.env.BOT_TOKEN,
        middlewares: [sessions.middleware()],
      }),
    }),
    CurrenciesModule,
  ],
  providers: [BotService, CurrencySum],
})
export class BotModule {}
