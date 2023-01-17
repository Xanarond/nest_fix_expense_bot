import { Action, Ctx, InjectBot, On, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { map } from 'rxjs';
import { CurrenciesService } from '../../currencies/currencies.service';

@Update()
export class CurrencySum {
  private _currency: CurrenciesService;
  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    currency: CurrenciesService,
  ) {
    this._currency = currency;
  }
  @Action('azn')
  async getAzn(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Введите сумму');
    ctx['session']['selected_currency'] = ctx.callbackQuery['data'];
  }

  @Action('rub')
  async getRub(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Введите сумму');
    ctx['session']['selected_currency'] = ctx.callbackQuery['data'];
  }
  @On('text')
  async countAznSum(@Ctx() ctx: Context) {
    //console.log(ctx['session']['selected_data']);
    if (ctx['session']['selected_currency'] === '') {
      return;
    }
    if (ctx['session']['selected_currency'] === 'azn') {
      ctx['session']['selected_currency'] = '';
      return this._currency.getCurrenciesFromFreeAPI().pipe(
        map((value: { couple: string; date: string; price: number }[]) => {
          value.map(async (val: { couple: string; price: number }) => {
            if (
              (val.couple.endsWith('/AZN') && val.couple === 'AZN/RUB') ||
              val.couple !== 'RUB/AZN'
            ) {
              return await ctx.reply(`Валютная пара: ${val.couple}
        Курс: ${parseFloat(String(val.price)) * Number(ctx.message['text'])}
        `);
            }
          });
        }),
      );
    }
    if (ctx['session']['selected_currency'] === 'rub') {
      ctx['session']['selected_currency'] = '';
      return this._currency.getCurrenciesFromFreeAPI().pipe(
        map((value: { couple: string; date: string; price: number }[]) => {
          value.map(async (val: { couple: string; price: number }) => {
            if (val.couple === 'RUB/AZN') {
              return await ctx.reply(`Валютная пара: ${val.couple}
        Курс: ${parseFloat(String(val.price)) * Number(ctx.message['text'])}
        `);
            }
          });
        }),
      );
    }
  }
}
