import { Action, Ctx, InjectBot, On, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { PostgresService } from '../../postgres/postgres.service';
import { Currencies } from '../../postgres/entities/currencies';

@Update()
export class CurrenciesSum {
  private _postgres: PostgresService;
  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    postgres: PostgresService,
  ) {
    this._postgres = postgres;
  }

  @Action('azn')
  async getAzn(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Введите сумму AZN:');
    ctx['session']['selected_currency'] = ctx.callbackQuery['data'];
  }

  @Action('rub')
  async getRub(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Введите сумму RUB:');
    ctx['session']['selected_currency'] = ctx.callbackQuery['data'];
  }

  @Action('usd')
  async getUsd(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Введите сумму USD:');
    ctx['session']['selected_currency'] = ctx.callbackQuery['data'];
  }

  @Action('eur')
  async getEur(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Введите сумму EUR:');
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
      return await this._postgres
        .fetchData()
        .then(async (value: Currencies[]) => {
          value.map(async (val: Currencies) => {
            if (val.couple.startsWith('AZN/')) {
              return await ctx.reply(`Валютная пара: ${val.couple}
        Курс: ${parseFloat(
          String(parseFloat(String(val.price)) * Number(ctx.message['text'])),
        ).toFixed(3)}
        `);
            }
          });
        });
    }
    if (ctx['session']['selected_currency'] === 'rub') {
      ctx['session']['selected_currency'] = '';
      return await this._postgres
        .fetchData()
        .then(async (value: Currencies[]) => {
          value.map(async (val: Currencies) => {
            if (val.couple.startsWith('RUB/')) {
              return await ctx.reply(`Валютная пара: ${val.couple}
        Курс: ${parseFloat(
          String(parseFloat(String(val.price)) * Number(ctx.message['text'])),
        ).toFixed(3)}
        `);
            }
          });
        });
    }
    if (ctx['session']['selected_currency'] === 'usd') {
      ctx['session']['selected_currency'] = '';
      return await this._postgres
        .fetchData()
        .then(async (value: Currencies[]) => {
          value.map(async (val: Currencies) => {
            if (val.couple.startsWith('USD/')) {
              return await ctx.reply(`Валютная пара: ${val.couple}
        Курс: ${parseFloat(
          String(parseFloat(String(val.price)) * Number(ctx.message['text'])),
        ).toFixed(3)}
        `);
            }
          });
        });
    }
    if (ctx['session']['selected_currency'] === 'eur') {
      ctx['session']['selected_currency'] = '';
      return await this._postgres
        .fetchData()
        .then(async (value: Currencies[]) => {
          value.map(async (val: Currencies) => {
            if (val.couple.startsWith('EUR/')) {
              return await ctx.reply(`Валютная пара: ${val.couple}
        Курс: ${parseFloat(
          String(parseFloat(String(val.price)) * Number(ctx.message['text'])),
        ).toFixed(3)}
        `);
            }
          });
        });
    }
  }
}
