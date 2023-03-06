import { Action, Ctx, Hears, InjectBot, Scene } from 'nestjs-telegraf';
import { Budget, PostgresService } from '../../postgres/postgres.service';
import { Context, Telegraf } from 'telegraf';
import { BudgetsEntity } from '../../postgres/entities/budgets.entity';
import { I18nTranslateService } from '../../i18n/i18n.service';

@Scene('budget')
export class BudgetScene {
  private _postgres: PostgresService;
  private _i18n: I18nTranslateService;

  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    postgres: PostgresService,
    i18n: I18nTranslateService,
  ) {
    this.bot = bot;
    this._postgres = postgres;
    this._i18n = i18n;
  }
  @Hears(RegExp(`^(\\d+(\\.\\d{1,3})?) ([A-Z]{3,4})$`))
  async insertBudget(@Ctx() ctx: Context) {
    const budget = new BudgetsEntity();
    budget.count = ctx.message['text'].split(' ')[0];
    budget.currency = ctx.message['text'].split(' ')[1];
    budget.belong = ctx.message.from.id;
    await this._postgres.insertBudgetSum(budget);
    await ctx.reply(await this._i18n.getAddedData(ctx['session']['language']));
    await ctx['scene'].leave();
  }

  @Action('add_budget_sum')
  async getBudget(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply(
      await this._i18n.getAboutBudget(ctx['session']['language']),
    );
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
          return await ctx.reply(
            await this._i18n.getBudgetNoData(ctx['session']['language']),
          );
        } else {
          await ctx.replyWithHTML(
            await this._i18n.getBudgetShowData(ctx['session']['language']),
          );
          return await ctx.replyWithHTML(budget.join(''));
        }
      });
    await ctx['scene'].leave();
  }
}
