import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CryptoCurrenciesEntity,
  CurrenciesEntity,
} from './entities/currencies.entity';
import { Repository } from 'typeorm';
import {
  CryptoCurrency,
  CurrenciesService,
  Currency,
} from '../currencies/currencies.service';
import { DateTime } from 'luxon';
import { TelegramUser } from './entities/telegram_users.entity';
import { CategoriesEntity } from './entities/categories.entity';
import { generate_categories } from './queries/categories';
import { CostsEntity } from './entities/costs.entity';
import { BudgetsEntity } from './entities/budgets.entity';
import { lastValueFrom, Subscription } from 'rxjs';
import { FIAT_CURRENCIES } from '../currencies/currencies.constants';

export type Budget = {
  currency: string;
  count: number;
};

export type Expenses = {
  date: string;
  expense_sum: number;
  category?: string;
  currency: string;
};

export type Categories = {
  category_id: number;
  category: string;
};
@Injectable()
export class PostgresService {
  private currenciesService: CurrenciesService;

  constructor(
    @InjectRepository(CurrenciesEntity)
    private readonly currenciesRepository: Repository<CurrenciesEntity>,
    @InjectRepository(TelegramUser)
    private readonly telegramUserRepository: Repository<TelegramUser>,
    @InjectRepository(CategoriesEntity)
    private readonly categoriesRepository: Repository<CategoriesEntity>,
    @InjectRepository(BudgetsEntity)
    private readonly budgetRepository: Repository<BudgetsEntity>,
    @InjectRepository(CostsEntity)
    private readonly costsRepository: Repository<CostsEntity>,
    currency: CurrenciesService,
  ) {
    this.currenciesService = currency;
    this.categoriesRepository.query(generate_categories).then();
  }

  async fetchFiatCurrencyData(currency?: string): Promise<CurrenciesEntity[]> {
    const current_date = DateTime.local().toFormat('yyyy-MM-dd');
    const previous_date = DateTime.local()
      .minus({ days: 1 })
      .toFormat('yyyy-MM-dd');
    const expression = await this.currenciesRepository.count({
      where: { date: current_date },
    });
    if (expression !== FIAT_CURRENCIES.length) {
      this.insertFiatCurrencies();
    }
    const queryBuilder = this.currenciesRepository
      .createQueryBuilder('currency')
      .distinctOn(['couple'])
      .select(['couple', 'price'])
      .where('currency.date between :date1 and :date2', {
        date1: previous_date,
        date2: current_date,
      });
    if (currency) {
      queryBuilder.andWhere('currency.couple like :couple', {
        couple: `${currency}/%`,
      });
    }
    return await queryBuilder.getRawMany();
  }

  async fetchCryptoCurrencyData(): Promise<CryptoCurrency[]> {
    const cryptoCurrencies = [];
    const data = this.currenciesService.getCryptoCurrencyBinance();
    const currencies = [];
    (await lastValueFrom(data)).map(async (value: CryptoCurrency) => {
      const crypto_currency = new CryptoCurrenciesEntity();
      crypto_currency.symbol = value.symbol;
      crypto_currency.price = value.price;
      currencies.push(crypto_currency);
    });
    cryptoCurrencies.push(...currencies);
    return cryptoCurrencies;
  }

  insertFiatCurrencies(): Subscription {
    return this.currenciesService
      .getCurrenciesFromFreeAPI()
      .subscribe((data: Currency[]) => {
        data.map(async (value: Currency) => {
          const currency = new CurrenciesEntity();
          currency.couple = value.couple;
          currency.date = value.date;
          currency.price = value.price;
          await this.currenciesRepository.upsert(currency, ['date', 'price']);
        });
      });
  }

  async loginTelegramBot(telegram_user: TelegramUser) {
    return this.telegramUserRepository.upsert(telegram_user, ['telegram_id']);
  }

  async getExpenses(
    id: number,
    period: string,
    language: string,
  ): Promise<Expenses[]> {
    const CATEGORY =
      language === 'ru' ? 'CATEGORIES.CATEGORY' : 'CATEGORIES.CATEGORY_EN';

    let PERIOD = '';

    switch (period) {
      case 'w':
        PERIOD = '1 week';
        break;
      case 'w2':
        PERIOD = '2 weeks';
        break;
      case 'm':
        PERIOD = '1 month';
        break;
      case 'm3':
        PERIOD = '3 months';
        break;
      case 'm6':
        PERIOD = '6 months';
        break;
      case 'y':
        PERIOD = '1 year';
        break;
      default:
        break;
    }

    return await this.costsRepository
      .createQueryBuilder('expenses')
      .leftJoinAndSelect(
        'expenses.expense_id',
        'categories',
        `CATEGORIES.CATEGORY_ID = expenses.expenseIdCategoryId`,
      )
      .where('expenses.telegramUserIdTelegramId = :id', { id })
      .andWhere(`expenses.date > NOW() - INTERVAL '${PERIOD}'`)
      .select([
        `to_char(expenses.date, 'DD-MM-YYYY') as date`,
        'expense_sum',
        `${CATEGORY} as category`,
        `currency`,
      ])
      .getRawMany();
  }

  insertNewCosts(costs: CostsEntity) {
    return this.costsRepository.insert(costs);
  }

  async showCategories(lang: string): Promise<Categories[]> {
    const select = lang === 'en' ? 'category_en' : 'category';
    const categories = await this.categoriesRepository.find({
      select: ['category_id', select],
    });
    return categories.map((el: CategoriesEntity) => ({
      category_id: el.category_id,
      category: el[select],
    }));
  }

  async insertBudgetSum(budget: BudgetsEntity) {
    await this.budgetRepository.upsert(budget, ['currency']);
  }

  async showBudgetSum(id: number): Promise<Budget[]> {
    return await this.budgetRepository
      .createQueryBuilder('budget')
      .select(['currency', 'count'])
      .where('budget.belongTelegramId = :telegram_id', {
        telegram_id: id,
      })
      .getRawMany();
  }
}
