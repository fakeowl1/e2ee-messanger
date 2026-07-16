import { Global, Module } from '@nestjs/common';
import { DRIZZLE } from './database.constants';
import { DrizzleProvider } from './providers/drizzle.provider';
import { PostgresProvider } from './providers/postgres.provider';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [PostgresProvider, DrizzleProvider],
  exports: [DRIZZLE],
})
export class DatabaseModule { }
