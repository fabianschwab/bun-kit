import type { Handle, ServerInit } from '@sveltejs/kit';
import { building } from '$app/environment';
import { getAuth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import '$lib/server/shutdown';
import { checkConnection, checkSchema } from '$lib/server/db';
import { sequence } from '@sveltejs/kit/hooks';

/**
 * Sets the theme from the cookie directly into the `html` tag, before returning it to the browser.
 * This prevents flashing or flickering after a refresh or  re-visit of the page.
 */
const setThemeFromCookie: Handle = async ({ event, resolve }) => {
	const themeFromCookie = event.cookies.get('theme');

	if (!themeFromCookie) {
		return await resolve(event);
	}

	return await resolve(event, {
		transformPageChunk: ({ html }) => {
			return html.replace('theme=""', `theme="${themeFromCookie}"`);
		}
	});
};

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

export const handle: Handle = sequence(setThemeFromCookie, handleBetterAuth);

export const init: ServerInit = async () => {
	console.log('Application startup ...');
	await checkConnection();
	await checkSchema();
	console.log('Application startup complete');
};
