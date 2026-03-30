import { command, form, getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { z } from 'zod/mini';
import { task } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { error, isHttpError, redirect } from '@sveltejs/kit';
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
	try {
		const tasks = await db.select().from(task).orderBy(asc(task.createdAt));
		return tasks;
	} catch (e) {
		console.error(e);
		error(500, 'Could not fetch tasks.');
	}
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

export const toggleCompleted = command(z.string(), async (id) => {
	requireAuthentication();
	try {
		const [taskToUpdate] = await db.select().from(task).where(eq(task.id, id));
		if (!taskToUpdate) {
			error(404, 'Task not found.');
		}
		await db.update(task).set({ completed: !taskToUpdate.completed }).where(eq(task.id, id));
	} catch (e) {
		// If it's already an HttpError (from the 404 check), rethrow it
		if (isHttpError(e)) {
			throw e;
		}
		console.error(e);
		error(500, 'Could not update task.');
	}
});

export const deleteTask = command(z.string(), async (id) => {
	requireAuthentication();
	try {
		const [taskToDelete] = await db.select().from(task).where(eq(task.id, id));
		if (!taskToDelete) {
			error(404, 'Task not found.');
		}
		await db.delete(task).where(eq(task.id, id));
	} catch (e) {
		// If it's already an HttpError (from the 404 check), rethrow it
		if (isHttpError(e)) {
			throw e;
		}
		console.error(e);
		error(500, 'Could not delete task.');
	}
});
