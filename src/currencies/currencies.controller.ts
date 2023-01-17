import { Controller, Get } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';

@Controller('currencies')
export class CurrenciesController {
  constructor(private currencyService: CurrenciesService) {}

  @Get('/currency')
  getBaseCurrency() {
    return this.currencyService.getCurrenciesFromFreeAPI();
  }
}
