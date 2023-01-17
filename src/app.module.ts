import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './bot/bot.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { PostgresModule } from './postgres/postgres.module';

@Module({
  imports: [ConfigModule.forRoot(), BotModule, CurrenciesModule, PostgresModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
