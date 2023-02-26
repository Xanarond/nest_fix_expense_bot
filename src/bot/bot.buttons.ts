import { Markup } from 'telegraf';

export class BotButtons {
  static startupButtons() {
    return Markup.keyboard(
      [
        Markup.button.callback('Ведение бюджета', 'budget'),
        Markup.button.callback(
          'Получение или расчет суммы курсов валют',
          'currency',
        ),
        Markup.button.callback('Учёт расходов', 'expenses'),
      ],
      {
        columns: 1,
      },
    );
  }

  static showCommandsMenu() {
    return Markup.inlineKeyboard(
      [
        Markup.button.callback('Курсы Валют', 'currencies'),
        Markup.button.callback('Расчет курса для суммы', 'currencies_sum'),
      ],
      {
        columns: 2,
      },
    );
  }

  static showValuteMenu() {
    return Markup.inlineKeyboard(
      [
        Markup.button.callback('AZN', 'azn'),
        Markup.button.callback('RUB', 'rub'),
        Markup.button.callback('USD', 'usd'),
        Markup.button.callback('EUR', 'eur'),
        Markup.button.callback('ILS', 'ils'),
        Markup.button.callback('AED', 'aed'),
      ],
      {
        columns: 3,
      },
    );
  }

  static showExpensesMenu() {
    return Markup.inlineKeyboard(
      [
        Markup.button.callback('Добавление расходов', 'add_expense'),
        Markup.button.callback('Отображение расходов', 'show_expenses'),
        /*Markup.button.callback('Редактировать расходы', 'update_expense'),
        Markup.button.callback('Добавить категорию расходов', 'add_category'),
        Markup.button.callback('Редактировать категорию', 'update_category'),*/
      ],
      {
        columns: 1,
      },
    );
  }

  static showBudgetOptions() {
    return Markup.inlineKeyboard(
      [
        Markup.button.callback('Добавление данных о бюджете', 'add_budget_sum'),
        Markup.button.callback('Отображение бюджета', 'show_budget'),
      ],
      {
        columns: 1,
      },
    );
  }

  static closeButtons() {
    return Markup.removeKeyboard();
  }
}
