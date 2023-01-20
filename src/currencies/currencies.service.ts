import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { combineLatestAll, map, mergeMap, Observable, of } from 'rxjs';
import { DateTime } from 'luxon';
@Injectable()
export class CurrenciesService {
  constructor(private httpService: HttpService) {}

  getCurrenciesFromFreeAPI(): Observable<
    { couple: string; date: string; price: number }[]
  > {
    const currencies = [
      'usd/azn',
      'usd/rub',
      'usd/eur',
      'eur/azn',
      'eur/usd',
      'eur/rub',
      'azn/rub',
      'azn/ils',
      'azn/usd',
      'azn/eur',
      'rub/azn',
      'rub/usd',
      'rub/eur',
    ];
    const cur_date = DateTime.local();
    const date = cur_date.toFormat('yyyy-MM-dd');
    const currencyArr = [];
    for (const currency in currencies) {
      const freeAPI = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${date}/currencies/${currencies[currency]}.min.json`;
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
              map((res): { couple: string; date: string; price: number } => {
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
