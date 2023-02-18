import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { combineLatestAll, map, mergeMap, Observable, of } from 'rxjs';
import { CRYPTO_CURRENCIES, FIAT_CURRENCIES } from './currencies.constants';

export type Currency = { couple: string; date: string; price: number };
export type CryptoCurrency = { symbol: string; price: number };

@Injectable()
export class CurrenciesService {
  constructor(private httpService: HttpService) {}

  getCryptoCurrencyBinance(): Observable<CryptoCurrency[]> {
    const with_rub = this.httpService.get(
      `https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(
        CRYPTO_CURRENCIES,
      )}`,
    );
    return with_rub.pipe(
      map((res) => {
        return res.data.map((value: CryptoCurrency) => {
          {
            return {
              symbol: value.symbol,
              price: Number(value.price),
            };
          }
        });
      }),
    );
  }
  getCurrenciesFromFreeAPI(): Observable<Currency[]> {
    const currencyArr = [];
    for (const currency in FIAT_CURRENCIES) {
      const freeAPI = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${FIAT_CURRENCIES[currency]}.json`;
      currencyArr.push(freeAPI);
    }

    return of(currencyArr).pipe(
      mergeMap((proj) => {
        return proj.map((val) => {
          return this.httpService
            .request({
              url: val,
              method: 'GET',
            })
            .pipe(
              map((res): Currency => {
                return {
                  couple: val.match(/currencies\/(.*?)\./)[1].toUpperCase(),
                  date: res.data.date,
                  price: parseFloat(<string>Object.values(res.data)[1]),
                };
              }),
            );
        });
      }),
      combineLatestAll(),
    );
  }
}
