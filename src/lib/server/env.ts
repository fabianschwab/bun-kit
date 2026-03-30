import { z, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { env } from '$env/dynamic/private';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	ORIGIN: z.url(),

	DATABASE_URL: z.url(),

	BETTER_AUTH_SECRET: z.string().min(32),

	OAUTH_CLIENT_ID: z.string(),
	OAUTH_CLIENT_SECRET: z.string(),
	OAUTH_DISCOVERY_URL: z.url()
});

let _ENV: z.infer<typeof envSchema> | null = null;

export function getEnv(): z.infer<typeof envSchema> {
	if (!_ENV) {
		try {
			_ENV = envSchema.parse(env);
		} catch (err) {
			throw new Error(fromZodError(err as ZodError).message);
		}
	}
	return _ENV;
}

export function checkEnvironment() {
	console.log('Checking Envrionment Variables ..');
	getEnv();
}
