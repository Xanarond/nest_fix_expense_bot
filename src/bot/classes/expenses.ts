import { Ctx, Hears, InjectBot, Update } from 'nestjs-telegraf';
import { PostgresService } from '../../postgres/postgres.service';
import { Context, Telegraf } from 'telegraf';
import { Buttons } from './buttons';

@Update()
export class Expenses {
  private _postgres: PostgresService;

  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    postgres: PostgresService,
  ) {
    this._postgres = postgres;
  }

  @Hears('Учёт расходов')
  async getCommands(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Вот основные команды:', Buttons.showExpensesMenu());
  }
  @Hears('Получение или расчет суммы курсов валют')
  async getCommand(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Вот основные команды:', Buttons.showCommandsMenu());
  }
}
