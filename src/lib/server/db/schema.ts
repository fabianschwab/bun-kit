import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const timestamps = {
	createdAt: timestamp('created_at', { mode: 'date' })
		.default(sql`now()`)
		.notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' })
		.default(sql`now()`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
};

export const task = pgTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1),
	completed: boolean('completed').notNull().default(false),
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
