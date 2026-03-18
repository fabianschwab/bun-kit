import { drizzle } from 'drizzle-orm/bun-sql';
import { SQL } from 'bun';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/bun-sql/migrator';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

if (!building && !env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const pg = new SQL(env.DATABASE_URL || '');

export const db = drizzle(pg, { schema });

export async function checkConnection(): Promise<void> {
	await db.execute(sql`SELECT 1`);
}

export async function checkTableExists(tableName: string): Promise<boolean> {
	const result = await db.execute<{ exists: boolean }>(sql`
		SELECT EXISTS (
			SELECT FROM information_schema.tables
			WHERE table_schema = 'public'
			AND table_name = ${tableName}
		) as exists
	`);
	return result[0]?.exists ?? false;
}

export async function checkSchema(): Promise<void> {
	try {
		// Check if migrations table exists
		const hasMigrations = await checkTableExists('__drizzle_migrations');

		if (!hasMigrations) {
			console.log('Running initial migrations...');
			await migrate(db, { migrationsFolder: './drizzle' });
			console.log('Migrations completed successfully');
		} else {
			// Run any pending migrations
			await migrate(db, { migrationsFolder: './drizzle' });
			console.log('Schema is up to date');
		}
	} catch (error) {
		console.error('Error checking/creating schema:', error);
		throw error;
	}
}
