import { defineConfig } from 'drizzle-kit';
import { readFileSync } from 'fs';
import { join } from 'path';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

/**
 * Note: There is a issue in drizzle-studio where the url overrides ssl configuration. If you need to use drizzle-studio as well change the configuration to use the individual parameters instead of the url and read the certificate file as shown below.
 */

// Read the certificate file
// const certPath = join(process.cwd(), '/cert/postgresql.crt');
// const cert = readFileSync(certPath, 'utf8');

// Use this form of the configuration
// 	dbCredentials: {
// 		database: "",
// 		user: "",
// 		password: "",
// 		host: "",
// 		port: 00000,
// 		ssl: {
// 			ca: cert,
// 			rejectUnauthorized: true
// 		}
// 	}

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: { url: process.env.DATABASE_URL },
	verbose: true,
	strict: true
});
