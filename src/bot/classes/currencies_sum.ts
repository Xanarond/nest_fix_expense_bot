import { Action, Ctx, Hears, InjectBot, On, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { PostgresService } from '../../postgres/postgres.service';
import { Currencies } from '../../postgres/entities/currencies';
import { Buttons } from './buttons';

@Update()
export class CurrenciesSum {
  private _postgres: PostgresService;

  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    postgres: PostgresService,
  ) {
    this._postgres = postgres;
  }

  @Hears('Получение или расчет суммы курсов валют')
  async getCommands(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Вот основные команды:', Buttons.showCommandsMenu());
  }

  @Action('currencies')
  async getCurrencies(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Вот актуальные курсы:');
    return await this._postgres
      .fetchData()
      .then(async (value: Currencies[]) => {
        value.map(async (val: Currencies) => {
          return await ctx.reply(`Валютная пара: ${val.couple}
        Курс: ${val.price}
        `);
        });
      });
  }

  @Action('currencies_sum')
  async getCurrenciesSum(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Введите текущюю валюту:', Buttons.showValuteMenu());
    // await ctx.sendMessage('');
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
