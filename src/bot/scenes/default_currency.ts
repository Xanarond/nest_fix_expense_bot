import { Action, Ctx, Scene } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotButtons } from '../bot.buttons';
import { I18nTranslateService } from '../../i18n/i18n.service';

const DEFAULT_CURRENCY = [
  'amd',
  'azn',
  'rub',
  'usd',
  'eur',
  'ils',
  'aed',
  'try',
  'gel',
];

@Scene('def_currency')
export class DefaultCurrency {
  constructor(private i18n: I18nTranslateService) {
    this.i18n = i18n;
  }
  @Action([...DEFAULT_CURRENCY])
  async getAzn(@Ctx() ctx: Context) {
    ctx['session']['selected_currency'] = '';
    const language = ctx['session']['language'];
    await ctx.deleteMessage();
    await ctx.reply(
      await this.i18n.getMainCurrency(
        language,
        ctx.callbackQuery['data'].toUpperCase(),
      ),
      BotButtons.showCommandsMenu(
        await this.i18n.commandsMenuButtons(language),
      ),
    );
    ctx['session']['selected_currency'] = ctx.callbackQuery['data'];
    await ctx['scene'].enter('currencies_sum');
  }
}
