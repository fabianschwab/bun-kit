import { drizzle } from 'drizzle-orm/bun-sqlite';
import { sql } from 'drizzle-orm';
import { Database } from 'bun:sqlite';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

if (!building && !env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const sqlite = new Database(env.DATABASE_URL, { create: true });

export const db = drizzle(sqlite, { schema });

export async function checkConnection(): Promise<void> {
	await db.run(sql`SELECT 1`);
}
