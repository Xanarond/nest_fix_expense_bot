import { Action, Ctx, Hears, InjectBot, Scene } from 'nestjs-telegraf';
import {
  Budget,
  Expenses,
  PostgresService,
} from '../../postgres/postgres.service';
import { Context, Telegraf } from 'telegraf';
import { CostsEntity } from '../../postgres/entities/costs.entity';
import { DateTime } from 'luxon';
import { CategoriesEntity } from '../../postgres/entities/categories.entity';
import { BudgetsEntity } from '../../postgres/entities/budgets.entity';
@Scene('expenses')
export class ExpensesScene {
  private _postgres: PostgresService;
  private readonly _budget: BudgetsEntity;
  private readonly _costs: CostsEntity;

  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    postgres: PostgresService,
  ) {
    this._budget = new BudgetsEntity();
    this._costs = new CostsEntity();
    this._postgres = postgres;
  }

  @Action('show_expenses')
  async showExpenses(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    const telegram_id = ctx.callbackQuery.from.id;

    const resp = [];

    await this._postgres
      .getExpenses(telegram_id)
      .then(async (res: Expenses[]) => {
        res.map((value: Expenses) => {
          resp.push(
            `<b>${value.date} ${value.expense_sum} ${value.currency} ${value.category}</b>\n`,
          );
        });
        if (resp.length === 0) {
          return ctx.reply('Поздравляю, у тебя нет пока еще расходов');
        } else {
          await ctx.reply('Вот данные по твоим расходам:');
          return await ctx.replyWithHTML(resp.join(''));
        }
      });
  }

  @Action('add_expense')
  async chooseCategory(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    ctx['session']['expense_indicator'] = true;
    const categories = [];
    await this._postgres.showCategories().then((value: CategoriesEntity[]) => {
      value.map((el: CategoriesEntity) =>
        categories.push(`<b>${el.category_id}. ${el.category}</b>\n`),
      );
    });
    await ctx.reply('Вот список доступных категорий:');
    await ctx.replyWithHTML(`${categories.join('')}
    Введите данные в формате: 1 01-01-2023 200 USD`);
  }

  @Hears(
    RegExp(`^(\\d+) (\\d{2}-\\d{2}-\\d{4}) (\\d+(\\.\\d{1,2})?) ([A-Z]{3,4})$`),
  )
  async insertValueCost(@Ctx() ctx: Context) {
    const telegram_id = ctx.message.from.id;
    const cost = ctx.update['message'].text.split(' ');
    const expense_id = Number(cost[0]);
    const expense_sum = parseFloat(cost[2]);
    const currency = cost[3];

    const budget_filter = [];

    await this._postgres
      .showBudgetSum(telegram_id)
      .then(async (value: Budget[]) => {
        const filter = value.filter((el: Budget) => el.currency === currency);
        budget_filter.push(...filter);
      });
    if (budget_filter.length === 0) {
      await ctx.reply(
        `Нет данных по этой валюте у тебя в бюджете. Поэтому расходы в ${currency} не внести!`,
      );
    }

    if (budget_filter.length !== 0) {
      budget_filter.map(async (el: Budget) => {
        if (el.count >= expense_sum) {
          this._budget.belong = telegram_id;
          const diff =
            parseFloat(String(el.count)) - parseFloat(String(expense_sum));

          this._budget.count = diff.toFixed(3);
          this._budget.currency = currency;
          await this._postgres.insertBudgetSum(this._budget);

          this._costs.telegram_user_id = telegram_id;
          this._costs.expense_id = expense_id;
          this._costs.date = DateTime.fromFormat(
            cost[1],
            'dd-MM-yyyy',
          ).toFormat('yyyy-MM-dd');
          this._costs.expense_sum = expense_sum;
          this._costs.currency = currency;
          await this._postgres.insertNewCosts(this._costs);

          await ctx.reply('Данные добавлены');
        } else {
          await ctx.reply('Расходы больше суммы твоего бюджета!');
        }
      });
    }
  }
}
