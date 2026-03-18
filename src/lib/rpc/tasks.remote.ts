import { command, form, getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { z } from 'zod/mini';
import { task } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import { route } from '$lib/ROUTES';

function requireAuthentication() {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		redirect(307, route('/'));
	}
	return locals.user;
}

export const getTasks = query(async () => {
	requireAuthentication();
	const tasks = await db.select().from(task).orderBy(asc(task.createdAt));
	return tasks;
});

export const createTask = form(
	z.object({
		title: z.string()
	}),
	async (data) => {
		requireAuthentication();
		try {
			await db.insert(task).values({ title: data.title }).returning({ id: task.id });
		} catch (e) {
			console.error(e);
			error(500, 'Could not create task.');
		}
	}
);

export const toggleComplated = command(z.string(), async (id) => {
	requireAuthentication();
	const [taskToUpdate] = await db.select().from(task).where(eq(task.id, id));
	if (!taskToUpdate) {
		error(404, 'Could not update task. Task not found.');
	}
	await db.update(task).set({ completed: !taskToUpdate.completed }).where(eq(task.id, id));
});

export const deleteTask = command(z.string(), async (id) => {
	requireAuthentication();
	const [taskToDelete] = await db.select().from(task).where(eq(task.id, id));
	if (!taskToDelete) {
		error(404, 'Could not delete task. Task not found.');
	}
	await db.delete(task).where(eq(task.id, id));
});
