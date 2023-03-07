import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import * as LocalSession from 'telegraf-session-local';
import { TelegrafModule } from 'nestjs-telegraf';
import { PostgresModule } from '../postgres/postgres.module';
import { CurrenciesSum } from './scenes/currencies_sum.scene';
import { ExpensesScene } from './scenes/expenses.scene';
import { BudgetScene } from './scenes/budget.scene';
import { DefaultCurrency } from './scenes/default_currency';
import { I18nTranslateModule } from '../i18n/i18n.module';
import { BotLanguage } from './scenes/bot_language';

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
    I18nTranslateModule,
  ],
  providers: [
    BotService,
    ExpensesScene,
    CurrenciesSum,
    BudgetScene,
    DefaultCurrency,
    BotLanguage,
  ],
})
export class BotModule {}
