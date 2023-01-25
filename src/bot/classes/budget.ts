import { Ctx, Hears, InjectBot, Update } from 'nestjs-telegraf';
import { PostgresService } from '../../postgres/postgres.service';
import { Context, Telegraf } from 'telegraf';

@Update()
export class Budget {
  private _postgres: PostgresService;

  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    postgres: PostgresService,
  ) {
    this._postgres = postgres;
  }

  @Hears('Ведение бюджета')
  async getCommands(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Вот основные команды');
  }
}
