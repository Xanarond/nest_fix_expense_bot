import { Markup } from 'telegraf';

export class Buttons {
  static createButtons() {
    return Markup.keyboard(
      [
        Markup.button.callback('Актуальные курсы валют', 'hello'),
        Markup.button.callback('hi', 'hello'),
        Markup.button.callback('Получить', 'hello'),
      ],
      {
        columns: 2,
      },
    );
  }

  static showCommandsMenu() {
    return Markup.inlineKeyboard(
      [
        Markup.button.callback('Курсы Валют', 'currencies'),
        Markup.button.callback('Расчет курс для суммы', 'currencies_sum'),
      ],
      {
        columns: 2,
      },
    );
  }

  static showValuteMenu() {
    return Markup.inlineKeyboard(
      [
        Markup.button.callback('Манат', 'azn'),
        Markup.button.callback('Рубль', 'rub'),
        Markup.button.callback('Доллар', 'usd'),
        Markup.button.callback('Евро', 'eur'),
      ],
      {
        columns: 2,
      },
    );
  }
  static closeButtons() {
    return Markup.removeKeyboard();
  }
}
