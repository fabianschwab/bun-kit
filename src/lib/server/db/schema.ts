import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

const timestamps = {
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
};

export const task = sqliteTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1),
	completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
	...timestamps
});

export const jwks = sqliteTable('jwks', {
	id: text('id').primaryKey(),
	publicKey: text('public_key').notNull(),
	privateKey: text('private_key').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp_ms' })
});

export * from './auth.schema';
