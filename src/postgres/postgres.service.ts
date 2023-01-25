import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Currencies } from './entities/currencies';
import { Repository } from 'typeorm';
import { CurrenciesService } from '../currencies/currencies.service';
import { DateTime } from 'luxon';
import { TelegramUsers } from './entities/telegram_users';
import { Categories } from './entities/categories';
import { generate_categories } from './queries/categories';

@Injectable()
export class PostgresService {
  private _currency: CurrenciesService;

  constructor(
    @InjectRepository(Currencies)
    private readonly currenciesRepository: Repository<Currencies>,
    @InjectRepository(TelegramUsers)
    private readonly telegramUserRepository: Repository<TelegramUsers>,
    @InjectRepository(Categories)
    private readonly categoriesRepository: Repository<Categories>,
    currency: CurrenciesService,
  ) {
    this._currency = currency;
    this.categoriesRepository.query(generate_categories).then();
  }

  async fetchData(): Promise<Currencies[]> {
    const current_date = DateTime.local().toFormat('yyyy-MM-dd');
    const expression = await this.currenciesRepository.count({
      where: {
        date: current_date,
      },
    });

    if (expression === 0 || expression !== 13) {
      const previous_date = DateTime.local()
        .minus({ days: 1 })
        .toFormat('yyyy-MM-dd');

      this.insertNewData();

      return this.currenciesRepository.find({
        where: {
          date: previous_date,
        },
      });
    }

    return this.currenciesRepository.find({
      where: {
        date: current_date,
      },
    });
  }

  insertNewData() {
    return this._currency
      .getCurrenciesFromFreeAPI()
      .subscribe((data: { couple: string; date: string; price: number }[]) => {
        data.map(
          async (value: { couple: string; date: string; price: number }) => {
            const currency = new Currencies();
            currency.couple = value.couple;
            currency.date = value.date;
            currency.price = value.price;
            await this.currenciesRepository.upsert(currency, ['date', 'price']);
          },
        );
      });
  }

  async loginTelegramBot(telegram_user: TelegramUsers) {
    return this.telegramUserRepository.upsert(telegram_user, ['telegram_id']);
  }

  insertNewCosts() {}
}
