import type { Handle, ServerInit } from '@sveltejs/kit';
import { building } from '$app/environment';
import { getAuth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import '$lib/server/shutdown';
import { checkConnection } from '$lib/server/db';

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const auth = getAuth();
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	const response = await svelteKitHandler({ event, resolve, auth, building });

	// Prevent caching of authenticated pages
	if (event.url.pathname.startsWith('/dashboard')) {
		response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');
	}

	return response;
};

export const handle: Handle = handleBetterAuth;

export const init: ServerInit = async () => {
	console.log('Application startup ...');
	await checkConnection();
	// more checks can de done here
	console.log('Application startup complete');
};
