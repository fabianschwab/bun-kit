import { redirect } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';

function requireAuthentication() {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		redirect(307, '/');
	}
	return locals.user;
}
