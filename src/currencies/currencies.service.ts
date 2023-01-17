import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { combineLatestAll, map, mergeMap, of } from 'rxjs';

@Injectable()
export class CurrenciesService {
  constructor(private httpService: HttpService) {}

  getCurrenciesFromFreeAPI() {
    const currencies = ['usd/azn', 'eur/azn', 'rub/azn', 'azn/rub', 'azn/ils'];
    const data = new Date().toISOString().split('T')[0];
    const currencyArr = [];
    for (const currency in currencies) {
      const freeAPI = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/${data}/currencies/${currencies[currency]}.min.json`;
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
              map((res) => {
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
