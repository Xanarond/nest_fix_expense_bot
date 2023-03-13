import { Action, Ctx, Hears, InjectBot, Scene } from 'nestjs-telegraf';
import {
  Budget,
  Categories,
  PostgresService,
} from '../../postgres/postgres.service';
import { Context, Telegraf } from 'telegraf';
import { CostsEntity } from '../../postgres/entities/costs.entity';
import { DateTime } from 'luxon';
import { BudgetsEntity } from '../../postgres/entities/budgets.entity';
import { I18nTranslateService } from '../../i18n/i18n.service';
import { BotButtons } from '../bot.buttons';
@Scene('expenses')
export class ExpensesScene {
  private _postgres: PostgresService;
  private readonly _budget: BudgetsEntity;
  private readonly _costs: CostsEntity;
  private readonly _i18n: I18nTranslateService;

  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    postgres: PostgresService,
    i18n: I18nTranslateService,
  ) {
    this._budget = new BudgetsEntity();
    this._costs = new CostsEntity();
    this._postgres = postgres;
    this._i18n = i18n;
  }

  @Action('show_expenses')
  async getExpensesPeriods(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    const language = ctx['session']['language'];
    await ctx['scene'].enter('period');
    await ctx.reply(
      await this._i18n.getChooseCommands(language),
      BotButtons.showExpensesPeriod(
        await this._i18n.commandsExpensesPeriods(language),
      ),
    );
  }

  @Action('add_expense')
  async chooseCategory(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    ctx['session']['expense_indicator'] = true;
    const categories = [];
    await this._postgres
      .showCategories(ctx['session']['language'])
      .then((value: Categories[]) => {
        value.map((el: Categories) =>
          categories.push(`<b>${el.category_id}. ${el.category}</b>\n`),
        );
      });
    await ctx.reply(
      await this._i18n.getExpensesCategories(ctx['session']['language']),
    );
    await ctx.replyWithHTML(
      await this._i18n.getExpensesFormat(
        ctx['session']['language'],
        categories.join(''),
      ),
    );
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
        await this._i18n.getExpensesNoData(
          ctx['session']['language'],
          currency,
        ),
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

          await ctx.reply(
            await this._i18n.getAddedData(ctx['session']['language']),
          );
        } else {
          await ctx.reply(
            await this._i18n.getExpensesImpossible(ctx['session']['language']),
          );
        }
      });
    }
  }
}
