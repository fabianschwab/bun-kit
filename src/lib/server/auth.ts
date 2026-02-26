import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { genericOAuth } from 'better-auth/plugins/generic-oauth';

let _auth: ReturnType<typeof betterAuth> | null = null;
export function getAuth() {
	if (_auth) return _auth;

	const secret = env.BETTER_AUTH_SECRET;
	if (!secret) {
		throw new Error('BETTER_AUTH_SECRET is not set');
	}

	_auth = betterAuth({
		baseURL: env.ORIGIN,
		secret: env.BETTER_AUTH_SECRET,
		database: drizzleAdapter(db, { provider: 'sqlite' }),
		plugins: [
			genericOAuth({
				config: [
					{
						providerId: 'appid',
						clientId: env.OAUTH_CLIENT_ID as string,
						clientSecret: env.OAUTH_CLIENT_SECRET as string,
						discoveryUrl: env.OAUTH_DISCOVERY_URL as string
					}
				]
			}),
			sveltekitCookies(() => getRequestEvent())
		],
		session: {
			cookieCache: {
				enabled: true,
				maxAge: 5 * 60 // 5 min cache duration in seconds (reduces the db calls)
			},
			expiresIn: 60 * 60 * 24 * 7, // 7 days
			updateAge: 60 * 60 * 24 // 1 day (every 1 day the session expiration is updated)
		},
		rateLimit: {
			window: 10, // time window in seconds
			max: 100 // max requests in the window
		}
	});

	return _auth;
}
