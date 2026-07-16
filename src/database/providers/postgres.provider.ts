import { Logger, OnApplicationShutdown } from '@nestjs/common';
import postgres from 'postgres';
import { POSTGRES_CLIENT } from '../database.constants';
import { ConfigService } from '@nestjs/config';

export class PostgresClientProvider implements OnApplicationShutdown {
  private readonly logger = new Logger(PostgresClientProvider.name);

  constructor(public readonly client: postgres.Sql) { }
  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Closing database connection (signal: ${signal})`);
    await this.client.end();
  }
}

export const PostgresProvider = {
  provide: POSTGRES_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): PostgresClientProvider => {
    const url = configService.get<string>('DATABASE_URL', {
      infer: true,
    });

    if (!url) {
      throw new Error(
        'Database connection URL(DATABASE_URL) is not defined in the environment variables!',
      );
    }

    const client = postgres(url, { prepare: false });
    return new PostgresClientProvider(client);
  },
};
