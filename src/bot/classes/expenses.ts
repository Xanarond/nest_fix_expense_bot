import { Action, Ctx, Hears, InjectBot, Update } from 'nestjs-telegraf';
import { PostgresService } from '../../postgres/postgres.service';
import { Context, Telegraf } from 'telegraf';
import { Buttons } from './buttons';
import { CostsEntity } from '../../postgres/entities/costs.entity';
import { DateTime } from 'luxon';
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
  async getCostsCommands(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Вот основные команды:', Buttons.showExpensesMenu());
  }

  @Action('show_expenses')
  async getBudget(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    const telegram_id = ctx.callbackQuery.from.id;

    const resp = [];

    await this._postgres.getExpenses(telegram_id).then(async (res) => {
      res.map((value) => {
        resp.push(
          `<b>${value.date} ${value.expense_sum} ${value['category']}</b>\n`,
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
    await this._postgres.showCategories().then((value) => {
      value.map((el) =>
        categories.push(`<b>${el.category_id}. ${el.category}</b>\n`),
      );
    });
    await ctx.reply('Вот список доступных категорий:');
    await ctx.replyWithHTML(`${categories.join('')}
    Введите данные в формате: 1 01-01-2023 200`);
  }

  @Hears(RegExp(`^(\\d+) (\\d{2}-\\d{2}-\\d{4}) (\\d+)$`))
  async insertValueCost(@Ctx() ctx: Context) {
    if (ctx['session']['expense_indicator'] === false) {
      return;
    }
    if (ctx['session']['expense_indicator'] === true) {
      ctx['session']['expense_indicator'] = false;
      const cost = ctx.update['message'].text;
      const split_cost = cost.split(' ');
      console.log(typeof split_cost[1]);
      if (split_cost.length < 3) {
        await ctx.reply('Проверь правильность введенных данных');
      } else {
        ctx['session']['expense_indicator'] = false;
        const costs = new CostsEntity();
        costs.telegram_user_id = ctx.message.from.id;
        costs.expense_id = Number(split_cost[0]);
        costs.date = DateTime.fromFormat(split_cost[1], 'dd-MM-yyyy').toFormat(
          'yyyy-MM-dd',
        );
        costs.expense_sum = Number(split_cost[2]);
        await this._postgres.insertNewCosts(costs);
        await ctx.reply('Данные добавлены');
      }
    }
  }
}
