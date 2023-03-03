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
  @Hears(RegExp(`^(\\d+(\\.\\d{1,3})?) ([A-Z]{3,4})$`))
  async insertBudget(@Ctx() ctx: Context) {
    const budget = new BudgetsEntity();
    budget.count = ctx.message['text'].split(' ')[0];
    budget.currency = ctx.message['text'].split(' ')[1];
    budget.belong = ctx.message.from.id;
    await this._postgres.insertBudgetSum(budget);
    await ctx.reply('Данные добавлены');
    await ctx['scene'].leave();
  }

  @Action('add_budget_sum')
  async getBudget(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply(`Введите данные такого формата 
    100.50 VAL или 1 VAL где сумма может быть как целым так и дробным числом, а VAL - валюта.
    Пример валют: USD, EUR, ILS, BTC, ETH, USDT и т.д.
    Пример вводимых данных: 100.50 USD или 100 EUR
    `);
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
