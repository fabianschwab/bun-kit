import { drizzle } from 'drizzle-orm/bun-sql';
import { SQL } from 'bun';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/bun-sql/migrator';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';
import { readFileSync } from 'fs';
import { join } from 'path';

if (!building && !env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Lazy initialization of database connection to mitigate issues while building the application.
// The connection will be established when the first query is executed.
let pg: SQL | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function initializeDb() {
	if (dbInstance) return dbInstance;

	try {
		// Read the certificate file at runtime
		const certPath = join(process.cwd(), '/cert/postgresql.crt');
		const cert = readFileSync(certPath, 'utf8');

		// Configure PostgreSQL connection with SSL certificate
		pg = new SQL(env.DATABASE_URL, {
			tls: {
				ca: cert,
				rejectUnauthorized: true
			}
		});
		dbInstance = drizzle(pg, { schema });
		return dbInstance;
	} catch (error) {
		console.error('Error reading SSL certificate:', error);
		// Terminate application
		process.exit(1);
	}
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
	get(_target, prop) {
		const instance = initializeDb();
		return instance[prop as keyof typeof instance];
	}
});

export async function checkConnection(): Promise<void> {
	console.log('Checking database connection...');
	try {
		await db.execute(sql`SELECT 1`);
		console.log('Database connection successful');
	} catch (error) {
		console.error('Database connection error:', error);
		// Terminate application
		process.exit(1);
	}
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
