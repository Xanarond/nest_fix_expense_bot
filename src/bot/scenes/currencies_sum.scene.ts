import { Action, Ctx, InjectBot, On, Scene } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { PostgresService } from '../../postgres/postgres.service';
import { BotButtons } from '../bot.buttons';
import { CurrenciesEntity } from '../../postgres/entities/currencies.entity';
import { CryptoCurrency } from '../../currencies/currencies.service';

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
  async getCurrenciesCommands(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Выберите команду:', BotButtons.showCurrenciesOptions());
  }

  @Action('main_currency')
  async getMainCurrency(@Ctx() ctx: Context) {
    const main_currency = ctx['session']['selected_currency'];
    if (!main_currency) {
      await ctx.reply('Не удалось получить основную валюту');
      return;
    }

    await ctx.deleteMessage();
    await ctx.reply('Вот актуальные курсы:');

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
      ({ symbol, price }) => `<b>Пара: ${symbol} Курс: ${price}</b>\n`,
    );
    const fiat_currencies = fiatData.map(
      ({ couple, price }) => `<b>Пара: ${couple} Курс: ${price}</b>\n`,
    );

    const main_currencies = [...crypts, ...fiat_currencies];
    if (main_currencies.length === 0) {
      await ctx.reply('Нет информации на данный момент');
      await ctx.reply(
        'Вы можете ☟',
        Markup.inlineKeyboard([
          Markup.button.callback(
            '◀ Вернутся к выбору валюты',
            'another_currency',
          ),
          Markup.button.callback('▲ Перейти назад', 'currencies'),
        ]),
      );
    } else {
      await ctx.replyWithHTML(main_currencies.join(''));
      await ctx.reply(
        'Вы можете ☟',
        Markup.inlineKeyboard([
          Markup.button.callback(
            '◀ Вернутся к выбору валюты',
            'another_currency',
          ),
          Markup.button.callback('▲ Перейти назад', 'currencies'),
        ]),
      );
    }
  }

  @Action('all_currencies')
  async getCurrencies(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx.reply('Вот актуальные курсы:');

    const [cryptoData, fiatData] = await Promise.all([
      await this._postgres.fetchCryptoCurrencyData(),
      await this._postgres.fetchFiatCurrencyData(),
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
      await ctx.reply(
        'Вы можете ☟',
        Markup.inlineKeyboard([
          Markup.button.callback(
            '◀ Вернутся к выбору валюты',
            'another_currency',
          ),
          Markup.button.callback('▲ Перейти назад', 'currencies'),
          Markup.button.callback('▲ Выйти из раздела', 'close_count'),
        ]),
      );
    }

    if (currencies.length !== 0) {
      await ctx.replyWithHTML(currencies.join(''));
      await ctx.reply(
        'Вы можете ☟',
        Markup.inlineKeyboard([
          Markup.button.callback(
            '◀ Вернутся к выбору валюты',
            'another_currency',
          ),
          Markup.button.callback('▲ Перейти назад', 'currencies'),
          Markup.button.callback('▲ Выйти из раздела', 'close_count'),
        ]),
      );
    }
  }

  @Action('currencies_sum')
  async getCurrenciesSum(@Ctx() ctx: Context) {
    const main_currency = ctx['session']['selected_currency'];
    await ctx.deleteMessage();
    await ctx.reply(`Доступные операции: +, *
    Например: 100; 100.343 * 5; 5.34 + 300
    Введите значения ${main_currency.toUpperCase()}:`);
  }

  @Action('another_currency')
  async getAnotherCurrency(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx['scene'].enter('def_currency');
    await ctx.reply(
      '💳 Выберите основную валюту для дальнейшего расчета:',
      BotButtons.showCurrencyMenu(),
    );
  }

  @Action('close_count')
  async exitFromCounting(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    await ctx['scene'].leave();
    await ctx.reply('☟ Выберите опцию из списка', BotButtons.startupButtons());
  }

  @On('text')
  async countSum(@Ctx() ctx: Context) {
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
      await ctx.reply('Проверьте правильность вводимых данных!');
      return;
    }

    if (message['text'].match(sum_regexp)) {
      console.log('сумма совпала');
      input += parseFloat(message['text']);
      console.log(input);
    }

    if (message['text'].match(operation_regexp)) {
      console.log(message['text'].split(' '));
      const template = message['text'].split(' ');
      if (template[1] === '+') {
        input = parseFloat(template[0]) + parseFloat(template[2]);
      }
      if (template[1] === '*') {
        input = parseFloat(template[0]) * parseFloat(template[2]);
      }
      if (template.length <= 1) {
        await ctx.reply('Проверьте правильность вводимых данных!');
        return;
      }
      console.log('совпадает');
    }
    const select_cur = ctx['session']['selected_currency'];
    if (!select_cur) {
      return;
    }

    console.log(input);

    const cryptoData = await this._postgres.fetchCryptoCurrencyData();

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
      filtered_currencies.map((currency: CurrenciesEntity) => {
        const rate =
          parseFloat(String(currency.price)) * parseFloat(String(input));
        currencies.push(
          `<b>Пара: ${currency.couple} Курс: ${rate.toFixed(3)}</b>\n`,
        );
      });
      if (ctx['session']['selected_currency'] === 'usd') {
        cryptoData.map(({ symbol, price }) => {
          const rate = parseFloat(String(input)) / parseFloat(String(price));
          currencies.push(`<b>Пара: ${symbol} Курс: ${rate.toFixed(3)}</b>\n`);
        });
      }
      await ctx.reply(
        `Ваше значение: ${input} ${ctx['session'][
          'selected_currency'
        ].toUpperCase()}`,
      );
      await ctx.replyWithHTML(currencies.join(''));
      await ctx.reply(
        'Вы можете продолжать вводить суммы либо:',
        Markup.inlineKeyboard([
          Markup.button.callback('◀ Выбрать другую валюту', 'another_currency'),
          Markup.button.callback('▲ Выйти из режима', 'close_count'),
        ]),
      );
    }
  }
}
