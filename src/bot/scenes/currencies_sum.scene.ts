import { Action, Ctx, InjectBot, On, Scene } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { PostgresService } from '../../postgres/postgres.service';
import { BotButtons } from '../bot.buttons';
import { CurrenciesEntity } from '../../postgres/entities/currencies.entity';
import { CryptoCurrency } from '../../currencies/currencies.service';
import { I18nTranslateService } from '../../i18n/i18n.service';

@Scene('currencies_sum')
export class CurrenciesSum {
  private _postgres: PostgresService;
  private _i18n: I18nTranslateService;

  constructor(
    @InjectBot() private bot: Telegraf<Context>,
    postgres: PostgresService,
    i18n: I18nTranslateService,
  ) {
    this._i18n = i18n;
    this._postgres = postgres;
  }

  @Action('currencies')
  async getCurrenciesCommands(@Ctx() ctx: Context) {
    const language = ctx['session']['language'];
    await ctx.deleteMessage();
    await ctx.reply(
      await this._i18n.getShowCommands(language),
      BotButtons.showCurrenciesOptions(
        await this._i18n.commandsCurrencies(language),
      ),
    );
  }

  @Action('main_currency')
  async getMainCurrency(@Ctx() ctx: Context) {
    const main_currency = ctx['session']['selected_currency'];
    const language = ctx['session']['language'];
    await ctx.deleteMessage();
    await ctx.reply(await this._i18n.getCurrencies(language));

    let fiatData: CurrenciesEntity[];
    let cryptoData: CryptoCurrency[] = [];

    if (main_currency !== 'usd') {
      fiatData = await this._postgres.fetchFiatCurrencyData(
        main_currency.toUpperCase(),
      );
    } else {
      [cryptoData, fiatData] = await Promise.all([
        await this._postgres.fetchCryptoCurrencyData(),
        await this._postgres.fetchFiatCurrencyData(main_currency.toUpperCase()),
      ]);
    }

    const crypts = cryptoData.map(
      ({ symbol, price }) => `<b>${symbol} | ${price}</b>\n`,
    );
    const fiat_currencies = fiatData.map(
      ({ couple, price }) => `<b>${couple} | ${price}</b>\n`,
    );

    const main_currencies = [...crypts, ...fiat_currencies];
    if (main_currencies.length === 0) {
      await ctx.reply(await this._i18n.getNoInfo(language));
      await ctx.reply(
        await this._i18n.getCanChoose(language),
        BotButtons.showCurrenciesSumOptions(
          await this._i18n.commandsCurrenciesSum(language),
        ),
      );
    } else {
      await ctx.replyWithHTML(main_currencies.join(''));
      await ctx.reply(
        await this._i18n.getCanChoose(language),
        BotButtons.showCurrenciesSumOptions(
          await this._i18n.commandsCurrenciesSum(language),
        ),
      );
    }
  }

  @Action('all_currencies')
  async getCurrencies(@Ctx() ctx: Context) {
    const language = ctx['session']['language'];
    await ctx.deleteMessage();
    await ctx.reply(await this._i18n.getCurrencies(language));

    const [cryptoData, fiatData] = await Promise.all([
      await this._postgres.fetchCryptoCurrencyData(),
      await this._postgres.fetchFiatCurrencyData(),
    ]);

    const crypts = cryptoData.map(
      ({ symbol, price }) => `<b>${symbol} | ${price}</b>\n`,
    );
    const fiat_currencies = fiatData.map(
      ({ couple, price }) => `<b>${couple} | ${price}</b>\n`,
    );

    const currencies = [...crypts, ...fiat_currencies];

    if (currencies.length === 0) {
      await ctx.reply(await this._i18n.getNoInfo(language));
      await ctx.reply(
        await this._i18n.getCanChoose(language),
        BotButtons.showCurrenciesSumOptions(
          await this._i18n.commandsCurrenciesSum(language),
        ),
      );
    }

    if (currencies.length !== 0) {
      await ctx.replyWithHTML(currencies.join(''));
      await ctx.reply(
        await this._i18n.getCanChoose(language),
        BotButtons.showCurrenciesSumOptions(
          await this._i18n.commandsCurrenciesSum(language),
        ),
      );
    }
  }

  @Action('currencies_sum')
  async getCurrenciesSum(@Ctx() ctx: Context) {
    const language = ctx['session']['language'];
    const main_currency = ctx['session']['selected_currency'];
    await ctx.deleteMessage();
    await ctx.reply(
      await this._i18n.getCurrencyAbout(language, main_currency.toUpperCase()),
    );
  }

  @Action('another_currency')
  async getAnotherCurrency(@Ctx() ctx: Context) {
    const language = ctx['session']['language'];
    await ctx.deleteMessage();
    await ctx['scene'].enter('def_currency');
    await ctx.reply(
      await this._i18n.getDefaultCurrency(language),
      BotButtons.showCurrencyMenu(),
    );
  }

  @Action('close_count')
  async exitFromCounting(@Ctx() ctx: Context) {
    const language = ctx['session']['language'];
    await ctx.deleteMessage();
    await ctx['scene'].leave();
    await ctx.reply(
      await this._i18n.getChooseCommands(language),
      BotButtons.startupButtons(
        await this._i18n.startupButtons(ctx['session']['language']),
      ),
    );
  }

  @On('text')
  async countSum(@Ctx() ctx: Context) {
    const language = ctx['session']['language'];
    const { message } = ctx;
    const sum_regexp = RegExp(`^(\\d+(\\.\\d{1,3})?)`);

    const operation_regexp = RegExp(
      `^\\d+(\\.\\d+)?\\s*[+*]\\s*\\d+(\\.\\d+)?$`,
    );
    let input = 0;

    if (
      !message['text'].match(sum_regexp) &&
      !message['text'].match(operation_regexp)
    ) {
      await ctx.reply(await this._i18n.getNotCorrect(language));
      return;
    }

    if (message['text'].match(sum_regexp)) {
      input += parseFloat(message['text']);
    }

    if (message['text'].match(operation_regexp)) {
      const template = message['text'].split(' ');
      if (template[1] === '+') {
        input = parseFloat(template[0]) + parseFloat(template[2]);
      }
      if (template[1] === '*') {
        input = parseFloat(template[0]) * parseFloat(template[2]);
      }
      if (template.length <= 1) {
        await ctx.reply(await this._i18n.getNotCorrect(language));
        return;
      }
    }
    const select_cur = ctx['session']['selected_currency'];
    if (!select_cur) {
      return;
    }

    const cryptoData = await this._postgres.fetchCryptoCurrencyData();
    const currencies_sum = await this._postgres.fetchFiatCurrencyData();

    const filtered_currencies = currencies_sum.filter(
      (currency: CurrenciesEntity) => {
        return currency.couple.startsWith(`${select_cur.toUpperCase()}/`);
      },
    );

    if (filtered_currencies.length === 0) {
      await ctx.reply(await this._i18n.getNoInfo(language));
    } else {
      const currencies = [];
      filtered_currencies.map((currency: CurrenciesEntity) => {
        const rate =
          parseFloat(String(currency.price)) * parseFloat(String(input));
        currencies.push(`<b>${currency.couple} | ${rate.toFixed(3)}</b>\n`);
      });
      if (ctx['session']['selected_currency'] === 'usd') {
        cryptoData.map(({ symbol, price }) => {
          const rate = parseFloat(String(input)) / parseFloat(String(price));
          currencies.push(`<b>${symbol} | ${rate.toFixed(3)}</b>\n`);
        });
      }
      await ctx.reply(
        await this._i18n.getCurrentValue(
          language,
          input,
          ctx['session']['selected_currency'].toUpperCase(),
        ),
      );
      await ctx.replyWithHTML(currencies.join(''));
      await ctx.reply(
        await this._i18n.getSumsDilemma(language),
        BotButtons.showCurrenciesSumOptions(
          await this._i18n.commandsCurrenciesSum(language),
        ),
      );
    }
  }
}
