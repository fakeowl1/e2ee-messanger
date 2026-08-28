import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';

import { DRIZZLE, POSTGRES_CLIENT } from '../database.constants';
import { PostgresClientProvider } from './postgres.provider';

import { relations } from '../relations';

interface AppConfig {
  nodeEnv: string;
}

export const DrizzleProvider = {
  provide: DRIZZLE,
  inject: [POSTGRES_CLIENT, ConfigService],
  useFactory: (
    postgresProvider: PostgresClientProvider,
    configService: ConfigService,
  ) => {
    const appConfig = configService.get<AppConfig>('app', {
      infer: true,
    }) as AppConfig;

    const isDevelopment = appConfig?.nodeEnv === 'development';

    return drizzle({
      client: postgresProvider.client,
      relations,
      logger: isDevelopment,
    });
  },
};
