import { Action, Ctx, Scene } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { I18nTranslateService } from '../../i18n/i18n.service';
import { Expenses, PostgresService } from '../../postgres/postgres.service';

const PERIOD = ['w', 'w2', 'm', 'm3', 'm6', 'y'];
@Scene('period')
export class ExpensePeriod {
  private _postgres: PostgresService;
  private _i18n: I18nTranslateService;
  constructor(private i18n: I18nTranslateService, postgres: PostgresService) {
    this._i18n = i18n;
    this._postgres = postgres;
  }
  @Action([...PERIOD])
  async getPeriod(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    const telegram_id = ctx.callbackQuery.from.id;
    ctx['session']['period'] = ctx.callbackQuery['data'];
    const resp = [];

    await this._postgres
      .getExpenses(
        telegram_id,
        ctx['session']['period'],
        ctx['session']['language'],
      )
      .then(async (res: Expenses[]) => {
        res.map((value: Expenses) => {
          resp.push(
            `<b>${value.date} ${value.expense_sum} ${value.currency} ${value.category}</b>\n`,
          );
        });
        if (resp.length === 0) {
          return ctx.reply(
            await this._i18n.getExpensesNo(ctx['session']['language']),
          );
        } else {
          await ctx.reply(
            await this._i18n.getExpensesInfo(ctx['session']['language']),
          );
          return await ctx.replyWithHTML(resp.join(''));
        }
      });

    await ctx['scene'].leave();
  }
}
