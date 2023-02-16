import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CurrenciesEntity } from './entities/currencies.entity';
import { Repository } from 'typeorm';
import { CurrenciesService } from '../currencies/currencies.service';
import { DateTime } from 'luxon';
import { TelegramUsers } from './entities/telegram_users.entity';
import { CategoriesEntity } from './entities/categories.entity';
import { generate_categories } from './queries/categories';
import { CostsEntity } from './entities/costs.entity';
import { BudgetsEntity } from './entities/budgets.entity';

export type Currency = { couple: string; date: string; price: number };

@Injectable()
export class PostgresService {
  private _currency: CurrenciesService;

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
    this._currency = currency;
    this.categoriesRepository.query(generate_categories).then();
  }

  async fetchData(): Promise<CurrenciesEntity[]> {
    const current_date = DateTime.local().toFormat('yyyy-MM-dd');
    const previous_date = DateTime.local()
      .minus({ days: 1 })
      .toFormat('yyyy-MM-dd');
    const expression = await this.currenciesRepository.count({
      where: {
        date: current_date,
      },
    });

    if (expression !== 13) {
      this.insertNewData();

      return this.currenciesRepository
        .createQueryBuilder('currency')
        .distinctOn(['couple'])
        .select(['id', 'couple', 'date', 'price'])
        .where('currency.date between :date1 and :date2', {
          date1: previous_date,
          date2: current_date,
        })
        .getRawMany();
    } else {
      return this.currenciesRepository
        .createQueryBuilder('currency')
        .distinctOn(['couple'])
        .select(['id', 'couple', 'date', 'price'])
        .where('currency.date between :date1 and :date2', {
          date1: previous_date,
          date2: current_date,
        })
        .getRawMany();
    }
  }

  insertNewData() {
    return this._currency
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

  async getExpenses(id: number) {
    console.log(id);
    return await this.costsRepository.query(
      `SELECT to_char(date, 'DD-MM-YYYY') as date, EXPENSE_SUM,
        CATEGORIES.CATEGORY
        FROM public.COSTS
LEFT JOIN PUBLIC.CATEGORIES ON CATEGORIES.CATEGORY_ID = COSTS."expenseIdCategoryId"
WHERE COSTS."telegramUserIdTelegramId" = ${id}`,
    );
  }

  insertNewCosts(costs: CostsEntity) {
    return this.costsRepository.insert(costs);
  }

  async showCategories() {
    return await this.categoriesRepository.find();
  }
}
