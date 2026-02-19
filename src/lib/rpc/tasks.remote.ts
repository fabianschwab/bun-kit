import { command, form, query } from '$app/server';
import { db } from '$lib/server/db';
import { z } from 'zod/mini';
import { task } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const getTasks = query(async () => {
	const tasks = await db.select().from(task).orderBy(asc(task.createdAt));
	return tasks;
});

export const createTask = form(
	z.object({
		title: z.string()
	}),
	async (data) => {
		await db.insert(task).values({ title: data.title });
	}
);

export const toggleComplated = command(z.string(), async (id) => {
	const taskToUpdate = db.select().from(task).where(eq(task.id, id)).get();
	if (!taskToUpdate) {
		error(404, 'Task not found');
	}
	await db.update(task).set({ completed: !taskToUpdate.completed }).where(eq(task.id, id));
});

export const deleteTask = command(z.string(), async (id) => {
	const taskToDelete = db.select().from(task).where(eq(task.id, id)).get();
	if (!taskToDelete) {
		error(404, 'Task not found');
	}
	await db.delete(task).where(eq(task.id, id));
});
