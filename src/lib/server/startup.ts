import { checkConnection, checkSchema } from '$lib/server/db';
import { checkEnvironment } from '$lib/server/env';

export async function startup() {
	console.log('Application startup ...');
	checkEnvironment();
	await checkConnection();
	await checkSchema();
	console.log('Application startup complete');
}
