import { Global, Module } from '@nestjs/common';
import { DRIZZLE } from './database.constants';
import { DrizzleProvider } from './providers/drizzle.provider';
import { PostgresProvider } from './providers/postgres.provider';
import { ConfigModule } from '@nestjs/config';

import appConfig from '../config/app.config';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ load: [appConfig] })],
  providers: [PostgresProvider, DrizzleProvider],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
