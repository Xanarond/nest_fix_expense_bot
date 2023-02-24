import { Action, Ctx, Hears, InjectBot, Scene } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { PostgresService } from '../../postgres/postgres.service';
import { BotButtons } from '../bot.buttons';
import { CurrenciesEntity } from '../../postgres/entities/currencies.entity';

@Scene('currencies_sum')
export class CurrenciesSum {
  private _postgres: PostgresService;

  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    postgres: PostgresService,
  ) {
    this._postgres = postgres;
  }

  @Action('currencies')
  async getCurrencies(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Вот актуальные курсы:');

    const [cryptoData, fiatData] = await Promise.all([
      (await this._postgres.fetchCryptoCurrencyData()).toPromise(),
      this._postgres.fetchFiatCurrencyData(),
    ]);

    const crypts = cryptoData.map(
      ({ symbol, price }) => `<b>Пара: ${symbol} Курс: ${price}</b>\n`,
    );
    const fiat_currencies = fiatData.map(
      ({ couple, price }) => `<b>Пара: ${couple} Курс: ${price}</b>\n`,
    );

    const currencies = [...crypts, ...fiat_currencies];

    if (currencies.length === 0) {
      await ctx.reply('Нет информации на данный момент');
      await ctx['scene'].leave();
    }

    if (currencies.length !== 0) {
      await ctx.replyWithHTML(currencies.join(''));
      await ctx['scene'].leave();
    }
  }

  @Action('currencies_sum')
  async getCurrenciesSum(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Введите текущюю валюту:', BotButtons.showValuteMenu());
  }

  @Hears(RegExp(`^(\\d+)`))
  async countSum(@Ctx() ctx: Context) {
    const { message } = ctx;
    const select_cur = ctx['session']['selected_currency'];
    if (!select_cur) {
      return;
    }

    const fiatCurrencies = ['azn', 'rub', 'usd', 'eur'];

    if (!fiatCurrencies.includes(select_cur)) {
      return;
    }

    const [cryptoData] = await Promise.all([
      (await this._postgres.fetchCryptoCurrencyData()).toPromise(),
    ]);

    const currencies_sum = await this._postgres.fetchFiatCurrencyData();

    const filtered_currencies = currencies_sum.filter(
      (currency: CurrenciesEntity) => {
        return currency.couple.startsWith(`${select_cur.toUpperCase()}/`);
      },
    );

    if (filtered_currencies.length === 0) {
      await ctx.reply('Нет информации на данный момент');
    } else {
      const currencies = [];
      filtered_currencies.map((currency) => {
        const rate =
          parseFloat(String(currency.price)) * parseFloat(message['text']);
        currencies.push(
          `<b>Пара: ${currency.couple} Курс: ${rate.toFixed(3)}</b>\n`,
        );
      });
      if (ctx['session']['selected_currency'] === 'usd') {
        cryptoData.map(({ symbol, price }) => {
          const rate = parseFloat(message['text']) / parseFloat(String(price));
          currencies.push(`<b>Пара: ${symbol} Курс: ${rate.toFixed(3)}</b>\n`);
        });
      }
      await ctx.replyWithHTML(currencies.join(''));
    }
    ctx['session']['selected_currency'] = '';
    await ctx['scene'].leave();
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
