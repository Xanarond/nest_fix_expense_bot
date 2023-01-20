import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Currencies } from './entities/currencies';
import { Repository } from 'typeorm';
import { CurrenciesService } from '../currencies/currencies.service';
import { DateTime } from 'luxon';

@Injectable()
export class PostgresService {
  private _currency: CurrenciesService;
  constructor(
    @InjectRepository(Currencies)
    private readonly currenciesRepository: Repository<Currencies>,
    currency: CurrenciesService,
  ) {
    this._currency = currency;
  }

  async fetchData() {
    const cur_date = DateTime.local();
    const formattedDate = cur_date.toFormat('yyyy-MM-dd');
    const expression = await this.currenciesRepository.count({
      where: {
        date: formattedDate,
      },
    });

    if (expression === 0) {
      const previous_date = formattedDate
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
        date: formattedDate,
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
            await this.currenciesRepository.insert(currency);
          },
        );
      });
  }
}
