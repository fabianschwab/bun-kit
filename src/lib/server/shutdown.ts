import { db } from '$lib/server/db';

let shuttingDown = false;

async function shutdown(signal: string) {
	if (shuttingDown) return;
	shuttingDown = true;

	console.log(`[shutdown] received ${signal}`);

	try {
		await db.$client.close();
		console.log('[shutdown] database disconnected');
	} catch (err) {
		console.error('[shutdown] error closing db', err);
	} finally {
		process.exit(0);
	}
}

// listen to the sveltekit:shutdown event which is emitted after the HTTP server has closed all connections.
process.on('sveltekit:shutdown', shutdown);
// for local development: crtl+c
process.on('SIGINT', shutdown);
