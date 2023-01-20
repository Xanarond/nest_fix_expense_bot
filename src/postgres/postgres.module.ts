import { Module } from '@nestjs/common';
import { PostgresService } from './postgres.service';
import { CurrenciesModule } from '../currencies/currencies.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currencies } from './entities/currencies';

@Module({
  imports: [CurrenciesModule, TypeOrmModule.forFeature([Currencies])],
  providers: [PostgresService],
  exports: [PostgresService],
})
export class PostgresModule {}
