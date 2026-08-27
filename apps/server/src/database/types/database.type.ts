import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { relations } from '../relations';

export type DrizzleDB = PostgresJsDatabase<typeof relations>;
