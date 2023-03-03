import {
  Command,
  Ctx,
  Hears,
  Help,
  InjectBot,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { BotButtons } from './bot.buttons';
import { PostgresService } from '../postgres/postgres.service';
import { TelegramUsers } from '../postgres/entities/telegram_users.entity';

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
    ctx['session']['selected_currency'] = '';
    ctx['session']['expense_indicator'] = false;
    const telegram_user: TelegramUsers = new TelegramUsers();
    telegram_user.telegram_id = ctx.message.from.id;
    telegram_user.first_name = ctx.message.from.first_name;
    telegram_user.username = ctx.message.from.username;
    telegram_user.last_name = ctx.message.from.last_name || null;
    telegram_user.is_premium = ctx.message.from.is_premium || false;
    telegram_user.language = ctx.message.from.language_code;

    await this._postgres.loginTelegramBot(telegram_user);

    await ctx.replyWithHTML(
      `<b>Добро пожаловать ${telegram_user.first_name} ${
        telegram_user.last_name || ''
      } в бот подсчета расходов</b>\n`,
      BotButtons.startupButtons(),
    );
  }

  @Help()
  async help(@Ctx() ctx: Context) {
    await ctx.replyWithHTML(
      '<b>Добро пожаловать в справку бота подсчета расходов</b> \n' +
        '1. <i>/commands</i> Получение списка команд бота \n' +
        'Все пожелания и вопросы: @xanarond',
    );
  }

  @Command('commands')
  async getBotCommands(@Ctx() ctx: Context) {
    await ctx.replyWithHTML(
      `<b>Вот остновной список команд:</b>\n`,
      BotButtons.startupButtons(),
    );
  }
  @Hears('Получение или расчет суммы курсов валют')
  async getCommand(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx['scene'].enter('def_currency');
    await ctx.reply(
      '💳 Выберите основную валюту для дальнейшего расчета:',
      BotButtons.showCurrencyMenu(),
    );
    console.log(ctx);
  }

  @Hears('Учёт расходов')
  async getCostsCommands(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx['scene'].enter('expenses');
    await ctx.reply('☟ Вот основные команды:', BotButtons.showExpensesMenu());
  }

  @Hears('Ведение бюджета')
  async getCommands(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx['scene'].enter('budget');
    await ctx.reply('☟ Вот основные команды', BotButtons.showBudgetOptions());
  }
}
