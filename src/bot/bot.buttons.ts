import { Markup } from 'telegraf';

export class BotButtons {
  static startupButtons(button_names: string[]) {
    return Markup.keyboard(
      [
        Markup.button.callback(button_names[0], 'budget'),
        Markup.button.callback(button_names[1], 'expenses'),
        Markup.button.callback(button_names[2], 'currency'),
      ],
      {
        columns: 1,
      },
    );
  }

  static showCommandsMenu(button_commands: string[]) {
    return Markup.inlineKeyboard(
      [
        Markup.button.callback(button_commands[0], 'currencies'),
        Markup.button.callback(button_commands[1], 'currencies_sum'),
        Markup.button.callback(button_commands[2], 'close_count'),
      ],
      {
        columns: 2,
      },
    );
  }

  static showCurrencyMenu() {
    return Markup.inlineKeyboard(
      [
        Markup.button.callback('AZN', 'azn'),
        Markup.button.callback('RUB', 'rub'),
        Markup.button.callback('USD', 'usd'),
        Markup.button.callback('EUR', 'eur'),
        Markup.button.callback('ILS', 'ils'),
        Markup.button.callback('AED', 'aed'),
        Markup.button.callback('TRY', 'try'),
        Markup.button.callback('GEL', 'gel'),
        Markup.button.callback('AMD', 'amd'),
      ],
      {
        columns: 3,
      },
    );
  }

  static showExpensesMenu(button_commands: string[]) {
    return Markup.inlineKeyboard(
      [
        Markup.button.callback(button_commands[0], 'add_expense'),
        Markup.button.callback(button_commands[1], 'show_expenses'),
        /*Markup.button.callback('Редактировать расходы', 'update_expense'),
        Markup.button.callback('Добавить категорию расходов', 'add_category'),
        Markup.button.callback('Редактировать категорию', 'update_category'),*/
      ],
      {
        columns: 1,
      },
    );
  }

  static showBudgetOptions(button_commands: string[]) {
    return Markup.inlineKeyboard(
      [
        Markup.button.callback(button_commands[0], 'add_budget_sum'),
        Markup.button.callback(button_commands[1], 'show_budget'),
      ],
      {
        columns: 1,
      },
    );
  }
  static showCurrenciesOptions(button_commands: string[]) {
    return Markup.inlineKeyboard(
      [
        Markup.button.callback(button_commands[0], 'all_currencies'),
        Markup.button.callback(button_commands[1], 'main_currency'),
        Markup.button.callback(button_commands[2], 'close_count'),
      ],
      {
        columns: 1,
      },
    );
  }

  static showCurrenciesSumOptions(button_commands: string[]) {
    return Markup.inlineKeyboard([
      Markup.button.callback(button_commands[0], 'another_currency'),
      Markup.button.callback(button_commands[1], 'currencies'),
      Markup.button.callback(button_commands[2], 'close_count'),
    ]);
  }

  static closeButtons() {
    return Markup.removeKeyboard();
  }
}
