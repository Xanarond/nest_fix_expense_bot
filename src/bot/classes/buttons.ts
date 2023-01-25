import { Markup } from 'telegraf';

export class Buttons {
  static startupButtons() {
    return Markup.keyboard(
      [
        Markup.button.callback(
          'Получение или расчет суммы курсов валют',
          'currency',
        ),
        Markup.button.callback('Учёт расходов', 'expenses'),
        Markup.button.callback('Ведение бюджета', 'budget'),
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

  static showExpensesMenu() {
    return Markup.inlineKeyboard(
      [
        Markup.button.callback('Добавление расходов', 'add_expense'),
        Markup.button.callback('Отображение расходов', 'show_expenses'),
        Markup.button.callback('Редактировать расходы', 'update_expense'),
        Markup.button.callback('Добавить категорию расходов', 'add_category'),
        Markup.button.callback('Редактировать категорию', 'update_category'),
      ],
      {
        columns: 3,
      },
    );
  }

  static closeButtons() {
    return Markup.removeKeyboard();
  }
}
