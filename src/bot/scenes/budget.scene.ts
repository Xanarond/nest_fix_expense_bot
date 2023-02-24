import { Action, Ctx, Hears, InjectBot, Scene } from 'nestjs-telegraf';
import { Budget, PostgresService } from '../../postgres/postgres.service';
import { Context, Telegraf } from 'telegraf';
import { BudgetsEntity } from '../../postgres/entities/budgets.entity';

@Scene('budget')
export class BudgetScene {
  private _postgres: PostgresService;

  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    postgres: PostgresService,
  ) {
    this.bot = bot;
    this._postgres = postgres;
  }
  @Hears(RegExp(`^(\\d+(\\.\\d{1,2})?) ([A-Z]{3,4})$`))
  async insertBudget(@Ctx() ctx: Context) {
    if (!ctx['session']['budget_currency']) {
      return;
    } else {
      ctx['session']['budget_currency'] = false;
      const budget = new BudgetsEntity();
      budget.count = ctx.message['text'].split(' ')[0];
      budget.currency = ctx.message['text'].split(' ')[1];
      budget.belong = ctx.message.from.id;
      await this._postgres.insertBudgetSum(budget);
      await ctx.reply('Данные введены');
      await ctx['scene'].leave();
    }
  }

  @Action('add_budget_sum')
  async getBudget(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply(`Введите данные такого формата\n
    200.50 USD или 200 USD
    `);
    ctx['session']['budget_currency'] = true;
  }

  @Action('show_budget')
  async showBudget(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    const telegram_id = ctx.callbackQuery.from.id;
    const budget = [];

    await this._postgres
      .showBudgetSum(telegram_id)
      .then(async (res: Budget[]) => {
        res.map((value: Budget) => {
          budget.push(`<b>${value.count} ${value.currency}</b>\n`);
        });
        if (budget.length === 0) {
          return ctx.reply('Нет данных по твоему бюджету');
        } else {
          await ctx.replyWithHTML('Вот данные по твоему бюджету:');
          return await ctx.replyWithHTML(budget.join(''));
        }
      });
    await ctx['scene'].leave();
  }
}
