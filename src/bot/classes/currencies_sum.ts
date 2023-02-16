import { Action, Ctx, Hears, InjectBot, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { PostgresService } from '../../postgres/postgres.service';
import { CurrenciesEntity } from '../../postgres/entities/currencies.entity';
import { Buttons } from './buttons';
import { Injectable } from '@nestjs/common';
@Injectable()
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
  async getCommand(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Вот основные команды:', Buttons.showCommandsMenu());
  }

  @Action('currencies')
  async getCurrencies(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Вот актуальные курсы:');

    const currencies = [];
    return await this._postgres
      .fetchData()
      .then(async (value: CurrenciesEntity[]) => {
        value.map(async (val: CurrenciesEntity) => {
          currencies.push(`<b>Пара: ${val.couple} Курс: ${val.price}</b>\n`);
        });
        if (currencies.length === 0) {
          await ctx.reply('Нет информации на данный момент');
        }
        if (currencies.length !== 0) {
          await ctx.replyWithHTML(currencies.join(''));
        }
      });
  }

  @Action('currencies_sum')
  async getCurrenciesSum(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Введите текущюю валюту:', Buttons.showValuteMenu());
    // await ctx.sendMessage('');
  }

  @Hears(RegExp(`^(\\d+)`))
  async countSum(@Ctx() ctx: Context) {
    console.log(
      ctx.message['text'],
      ctx['session']['expense_indicator'],
      ctx['session']['selected_currency'],
    );
    const currencies_sum = [];
    if (ctx['session']['selected_currency'] === '') {
      ctx['session']['selected_currency'] = '';
      return;
    }
    if (ctx['session']['selected_currency'] === 'azn') {
      ctx['session']['selected_currency'] = '';
      await this._postgres
        .fetchData()
        .then(async (value: CurrenciesEntity[]) => {
          value.map(async (val: CurrenciesEntity) => {
            if (val.couple.startsWith('AZN/')) {
              currencies_sum.push(
                `<b>Пара: ${val.couple} Курс: ${parseFloat(
                  String(
                    parseFloat(String(val.price)) * Number(ctx.message['text']),
                  ),
                ).toFixed(3)}</b>\n`,
              );
            }
          });
        });
      if (currencies_sum.length === 0)
        await ctx.reply('Нет информации на данный момент');
      else await ctx.replyWithHTML(`${currencies_sum.join('')}`);
    }
    if (ctx['session']['selected_currency'] === 'rub') {
      ctx['session']['selected_currency'] = '';
      await this._postgres
        .fetchData()
        .then(async (value: CurrenciesEntity[]) => {
          value.map(async (val: CurrenciesEntity) => {
            if (val.couple.startsWith('RUB/')) {
              currencies_sum.push(
                `<b>Пара: ${val.couple} Курс: ${parseFloat(
                  String(
                    parseFloat(String(val.price)) * Number(ctx.message['text']),
                  ),
                ).toFixed(3)}</b>\n`,
              );
            }
          });
        });
      if (currencies_sum.length === 0)
        await ctx.reply('Нет информации на данный момент');
      else await ctx.replyWithHTML(`${currencies_sum.join('')}`);
    }
    if (ctx['session']['selected_currency'] === 'usd') {
      ctx['session']['selected_currency'] = '';
      await this._postgres
        .fetchData()
        .then(async (value: CurrenciesEntity[]) => {
          value.map(async (val: CurrenciesEntity) => {
            if (val.couple.startsWith('USD/')) {
              currencies_sum.push(
                `<b>Пара: ${val.couple} Курс: ${parseFloat(
                  String(
                    parseFloat(String(val.price)) * Number(ctx.message['text']),
                  ),
                ).toFixed(3)}</b>\n`,
              );
            }
          });
        });
      if (currencies_sum.length === 0)
        await ctx.reply('Нет информации на данный момент');
      else await ctx.replyWithHTML(`${currencies_sum.join('')}`);
    }
    if (ctx['session']['selected_currency'] === 'eur') {
      ctx['session']['selected_currency'] = '';
      await this._postgres
        .fetchData()
        .then(async (value: CurrenciesEntity[]) => {
          value.map(async (val: CurrenciesEntity) => {
            if (val.couple.startsWith('EUR/')) {
              currencies_sum.push(
                `<b>Пара: ${val.couple} Курс: ${parseFloat(
                  String(
                    parseFloat(String(val.price)) * Number(ctx.message['text']),
                  ),
                ).toFixed(3)}</b>\n`,
              );
            }
          });
        });
      if (currencies_sum.length === 0)
        await ctx.reply('Нет информации на данный момент');
      else await ctx.replyWithHTML(`${currencies_sum.join('')}`);
    }
  }

  @Action('azn')
  async getAzn(@Ctx() ctx: Context) {
    ctx['session']['selected_currency'] = '';
    await ctx.deleteMessage();
    await ctx.reply('Введите сумму AZN:');
    ctx['session']['selected_currency'] = ctx.callbackQuery['data'];
  }

  @Action('rub')
  async getRub(@Ctx() ctx: Context) {
    ctx['session']['selected_currency'] = '';
    await ctx.deleteMessage();
    await ctx.reply('Введите сумму RUB:');
    ctx['session']['selected_currency'] = ctx.callbackQuery['data'];
  }

  @Action('usd')
  async getUsd(@Ctx() ctx: Context) {
    ctx['session']['selected_currency'] = '';
    await ctx.deleteMessage();
    await ctx.reply('Введите сумму USD:');
    ctx['session']['selected_currency'] = ctx.callbackQuery['data'];
  }

  @Action('eur')
  async getEur(@Ctx() ctx: Context) {
    ctx['session']['selected_currency'] = '';
    await ctx.deleteMessage();
    await ctx.reply('Введите сумму EUR:');
    ctx['session']['selected_currency'] = ctx.callbackQuery['data'];
  }
}
