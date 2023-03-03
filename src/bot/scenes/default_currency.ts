import { Action, Ctx, Scene } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotButtons } from '../bot.buttons';
@Scene('def_currency')
export class DefaultCurrency {
  @Action(['amd', 'azn', 'rub', 'usd', 'eur', 'ils', 'aed', 'try', 'gel'])
  async getAzn(@Ctx() ctx: Context) {
    ctx['session']['selected_currency'] = '';
    await ctx.deleteMessage();
    await ctx.reply(
      `Основной валютой расчета курса стала ${ctx.callbackQuery[
        'data'
      ].toUpperCase()}`,
      BotButtons.showCommandsMenu(),
    );
    ctx['session']['selected_currency'] = ctx.callbackQuery['data'];
    await ctx['scene'].enter('currencies_sum');
  }
}
