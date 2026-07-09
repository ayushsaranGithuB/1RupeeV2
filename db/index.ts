import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

let client: postgres.Sql;
let db: ReturnType<typeof drizzle>;

export function getDb() {
    if (!db) {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        client = postgres(databaseUrl, {
            max: process.env.NODE_ENV === 'production' ? 10 : 5,
        });
        db = drizzle(client);
    }

    return db;
}

export async function closeDb() {
    if (client) {
        await client.end();
    }
}
