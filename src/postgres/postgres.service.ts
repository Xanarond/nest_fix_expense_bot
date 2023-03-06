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
import { TelegramUsers } from './entities/telegram_users.entity';
import { CategoriesEntity } from './entities/categories.entity';
import { generate_categories } from './queries/categories';
import { CostsEntity } from './entities/costs.entity';
import { BudgetsEntity } from './entities/budgets.entity';
import { lastValueFrom, map, Subscription } from 'rxjs';
import { FIAT_CURRENCIES } from '../currencies/currencies.constants';

export type Budget = {
  currency: string;
  count: number;
};

export type Expenses = {
  date: string;
  expense_sum: number;
  category: string;
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
    @InjectRepository(TelegramUsers)
    private readonly telegramUserRepository: Repository<TelegramUsers>,
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

  async loginTelegramBot(telegram_user: TelegramUsers) {
    return this.telegramUserRepository.upsert(telegram_user, ['telegram_id']);
  }

  async getExpenses(id: number): Promise<Expenses[]> {
    return await this.costsRepository.query(
      `SELECT to_char(date, 'DD-MM-YYYY') as date, EXPENSE_SUM,
        CATEGORIES.CATEGORY, 
        CURRENCY
        FROM public.COSTS
LEFT JOIN PUBLIC.CATEGORIES ON CATEGORIES.CATEGORY_ID = COSTS."expenseIdCategoryId"
WHERE COSTS."telegramUserIdTelegramId" = ${id}`,
    );
  }

  insertNewCosts(costs: CostsEntity) {
    return this.costsRepository.insert(costs);
  }

  async showCategories(lang: string): Promise<Categories[]> {
    const categories = [];
    if (lang === 'ru') {
      await this.categoriesRepository
        .find({
          select: ['category_id', 'category'],
        })
        .then((value: CategoriesEntity[]) =>
          value.map((el: CategoriesEntity) => {
            const entity = {
              category_id: el.category_id,
              category: el.category,
            };
            categories.push(entity);
          }),
        );
    }
    if (lang === 'en') {
      await this.categoriesRepository
        .find({
          select: ['category_id', 'category_en'],
        })
        .then((value: CategoriesEntity[]) =>
          value.map((el: CategoriesEntity) => {
            const entity = {
              category_id: el.category_id,
              category: el.category_en,
            };
            categories.push(entity);
          }),
        );
    }
    console.log(categories, lang);
    return categories;
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
