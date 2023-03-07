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
import { I18nTranslateService } from '../i18n/i18n.service';

@Update()
export class BotService {
  private _postgres: PostgresService;
  private readonly _i18n: I18nTranslateService;
  private _telegram_user: TelegramUsers;

  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    postgres: PostgresService,
    i18n: I18nTranslateService,
  ) {
    this._i18n = i18n;
    this._postgres = postgres;
  }

  @Start()
  async start(@Ctx() ctx: Context) {
    ctx['session']['selected_currency'] = '';
    ctx['session']['expense_indicator'] = false;
    ctx['session']['language'] = ctx.message.from.language_code;

    const telegram_user = new TelegramUsers();
    telegram_user.telegram_id = ctx.message.from.id;
    telegram_user.first_name = ctx.message.from.first_name;
    telegram_user.username = ctx.message.from.username;
    telegram_user.last_name = ctx.message.from.last_name || null;
    telegram_user.is_premium = ctx.message.from.is_premium || false;
    telegram_user.language = ctx.message.from.language_code;
    this._telegram_user = telegram_user;

    await this._postgres.loginTelegramBot(this._telegram_user);

    await ctx.replyWithHTML(
      await this._i18n.getWelcome(this._telegram_user),
      BotButtons.startupButtons(
        await this._i18n.startupButtons(ctx['session']['language']),
      ),
    );
  }

  @Help()
  async help(@Ctx() ctx: Context) {
    await ctx.replyWithHTML(
      await this._i18n.getHelp(ctx['session']['language']),
    );
  }

  @Command('commands')
  async getBotCommands(@Ctx() ctx: Context) {
    await ctx.replyWithHTML(
      await this._i18n.getChooseCommands(ctx['session']['language']),
      BotButtons.startupButtons(
        await this._i18n.startupButtons(ctx['session']['language']),
      ),
    );
  }

  @Command('lang')
  async getBotLanguage(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx['scene'].enter('lang');
    await ctx.reply(
      await this._i18n.getChooseLanguage(ctx['session']['language']),
      BotButtons.chooseLanguage(),
    );
  }
  @Hears([
    'Получение или расчет суммы курсов валют',
    'Receiving or calculating the amount of exchange rates',
  ])
  async getCommand(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx['scene'].enter('def_currency');
    await ctx.reply(
      await this._i18n.getDefaultCurrency(ctx['session']['language']),
      BotButtons.showCurrencyMenu(),
    );
  }

  @Hears(['Учёт расходов', 'Expense accounting'])
  async getCostsCommands(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx['scene'].enter('expenses');
    await ctx.reply(
      await this._i18n.getShowCommands(ctx['session']['language']),
      BotButtons.showExpensesMenu(
        await this._i18n.commandsExpenses(ctx['session']['language']),
      ),
    );
  }

  @Hears(['Ведение бюджета', 'Budget management'])
  async getCommands(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx['scene'].enter('budget');
    await ctx.reply(
      await this._i18n.getShowCommands(ctx['session']['language']),
      BotButtons.showBudgetOptions(
        await this._i18n.commandsBudget(ctx['session']['language']),
      ),
    );
  }
}
