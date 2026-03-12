import { fail, redirect } from '@sveltejs/kit';
import { form, getRequestEvent, query } from '$app/server';
import { getAuth } from '$lib/server/auth';
import { z } from 'zod/mini';

export const login = form(z.object({ provider: z.string() }), async ({ provider }) => {
	const auth = getAuth();

	const result = await auth.api.signInWithOAuth2({
		body: {
			providerId: provider
		}
	});
	if (result.url) {
		return redirect(303, result.url);
	}
	return fail(400, { message: 'Sign-in failed' });
});

export const logout = form(async () => {
	const auth = getAuth();
	const { request } = getRequestEvent();

	await auth.api.signOut({ headers: request.headers });
	return redirect(303, '/');
});
