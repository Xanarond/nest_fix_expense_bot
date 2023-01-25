import { Injectable } from '@nestjs/common';
import { Command, Ctx, Help, InjectBot, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { Buttons } from './classes/buttons';
import { PostgresService } from '../postgres/postgres.service';
import { TelegramUsers } from '../postgres/entities/telegram_users';

@Injectable()
@Update()
export class BotService {
  private _postgres: PostgresService;

  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    postgres: PostgresService,
  ) {
    this._postgres = postgres;
  }

  @Start()
  async start(@Ctx() ctx: Context) {
    const telegram_user: TelegramUsers = new TelegramUsers();
    telegram_user.telegram_id = ctx.message.from.id;
    telegram_user.first_name = ctx.message.from.first_name;
    telegram_user.username = ctx.message.from.username;
    telegram_user.last_name = ctx.message.from.last_name || null;
    telegram_user.is_premium = ctx.message.from.is_premium || false;

    await this._postgres.loginTelegramBot(telegram_user);

    await ctx.replyWithHTML(
      `<b>Добро пожаловать ${telegram_user.first_name} ${
        telegram_user.last_name || ''
      } в бот подсчета расходов</b> \n`,
      Buttons.startupButtons(),
    );
    // await ctx.reply('bot', Buttons.createButtons());
  }

  @Help()
  async help(@Ctx() ctx: Context) {
    await ctx.replyWithHTML(
      '<b>Добро пожаловать в справку бота подсчета расходов</b> \n' +
        '1. <i>/commands</i> Получение списка команд бота \n' +
        '2. ..... \n' +
        '3. ..... \n',
    );
  }
  @Command('hello')
  async hey(@Ctx() ctx: Context) {
    await ctx.reply('Добро пожаловать в бот по расчету расходов');
  }

  /*  @Hears('currencies')
  async hears(@Ctx() ctx: Context) {
    await ctx.reply('вот курсы');
  }
   @On('callback_query')
  async on(@Ctx() ctx: Context) {
    await ctx.reply('👍');
  }*/

  /* @On('text')
  async getEcho(@Ctx() ctx: Context) {
    await ctx.reply(`${ctx.message['text']}`);
  }*/
}
