import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { getBotToken } from 'nestjs-telegraf';
import { config } from 'dotenv';

config();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: ['error', 'log'],
    },
  );
  const bot = app.get(getBotToken());
  app.use(bot.webhookCallback('/secret-path'));
  await app.listen(6000);
}

bootstrap().then();
