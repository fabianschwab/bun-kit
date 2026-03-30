import { drizzle } from 'drizzle-orm/bun-sql';
import { SQL } from 'bun';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/bun-sql/migrator';
import * as schema from './schema';
import { getEnv } from '$lib/server/env';
import { readFileSync } from 'fs';
import { join } from 'path';

// Lazy initialization of database connection to mitigate issues while building the application.
// The connection will be established when the first query is executed.
let pg: SQL | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function initializeDb() {
	if (dbInstance) return dbInstance;

	const env = getEnv();
	try {
		// Check if connection is TLS secured, only read the certificate if it is required
		let tls = undefined;
		if (env.DATABASE_URL.includes('sslmode=verify-full')) {
			// Read the certificate file at runtime
			const certPath = join(process.cwd(), '/cert/postgresql.crt');
			const cert = readFileSync(certPath, 'utf8');
			tls = {
				ca: cert,
				rejectUnauthorized: true
			};
		}

		// Configure PostgreSQL connection with SSL certificate
		pg = new SQL(env.DATABASE_URL, {
			tls
		});
		dbInstance = drizzle(pg, { schema });
		return dbInstance;
	} catch (error) {
		console.error(error);
		throw new Error('Error reading SSL certificate');
	}
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
	get(_target, prop) {
		const instance = initializeDb();
		return instance[prop as keyof typeof instance];
	}
});

export async function checkConnection(retries = 3, delayMs = 1000): Promise<void> {
	console.log('Checking database connection...');
	for (let i = 0; i < retries; i++) {
		try {
			await db.execute(sql`SELECT 1`);
			console.log('Database connection successful');
			return;
		} catch (err) {
			console.warn(`Attempt ${i + 1} failed: ${(err as Error).message}`);
			if (i < retries - 1) {
				await new Promise((r) => setTimeout(r, delayMs));
			} else {
				throw new Error(`Database connection error after ${retries} attempts`);
			}
		}
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
		const migrationsFolder = './drizzle';
		const hasMigrations = await checkTableExists('__drizzle_migrations');

		if (!hasMigrations) {
			console.log('Initial migrations detected. Running initial migrations...');
		} else {
			console.log('Running pending migrations (if any)...');
		}

		await migrate(db, { migrationsFolder });

		if (!hasMigrations) {
			console.log('Initial migrations completed successfully');
		} else {
			console.log('Schema is up to date');
		}
	} catch (error) {
		console.error('Error checking or creating schema:', error);
		throw new Error(`Schema migration failed: ${(error as Error).message}`);
	}
}
