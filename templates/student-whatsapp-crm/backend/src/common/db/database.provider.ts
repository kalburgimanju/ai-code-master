import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

/**
 * Picks the database backend from the environment:
 * - Postgres when DATABASE_URL is set (production).
 * - SQLite (file at data/crm.db) otherwise, for zero-setup local dev/demo.
 */
export function buildDatabaseOptions(): TypeOrmModuleOptions {
  const databaseUrl = process.env.DATABASE_URL;

  const base: TypeOrmModuleOptions = {
    autoLoadEntities: true,
    synchronize: true,
    logging: false,
  };

  if (databaseUrl) {
    return {
      ...base,
      type: 'postgres',
      url: databaseUrl,
      ssl: { rejectUnauthorized: false },
    } as TypeOrmModuleOptions;
  }

  // Isolated DB for tests (set by e2e spec) so dev data isn't disturbed.
  const testDb = process.env.CRM_TEST_DB;
  if (testDb) {
    return {
      ...base,
      type: 'better-sqlite3',
      database: testDb,
    } as TypeOrmModuleOptions;
  }

  return {
    ...base,
    type: 'better-sqlite3',
    database: join(process.cwd(), 'data', 'crm.db'),
  } as TypeOrmModuleOptions;
}
