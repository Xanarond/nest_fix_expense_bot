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
  );
  const bot = app.get(getBotToken());
  app.use(bot.webhookCallback('/secret-path'));
  await app.listen(3000);
}

bootstrap();
