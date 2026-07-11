import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import {
    audit_logs,
    campaigns,
    campaign_tiers,
    donations,
    ngos,
    pledges,
    payouts,
    transparency_reports,
    users,
    wallets,
    wallet_transactions,
} from './schema';

let client: postgres.Sql;
let db: ReturnType<typeof drizzle>;

const healthCheckTables = [
    { name: 'users', table: users },
    { name: 'wallets', table: wallets },
    { name: 'wallet_transactions', table: wallet_transactions },
    { name: 'ngos', table: ngos },
    { name: 'campaigns', table: campaigns },
    { name: 'campaign_tiers', table: campaign_tiers },
    { name: 'pledges', table: pledges },
    { name: 'donations', table: donations },
    { name: 'payouts', table: payouts },
    { name: 'audit_logs', table: audit_logs },
    { name: 'transparency_reports', table: transparency_reports },
] as const;

export type DatabaseHealthCheck = {
    connected: boolean;
    healthy: boolean;
    tables: Array<{
        name: string;
        rowCount: number;
        hasData: boolean;
    }>;
};

export function getDatabaseUrl() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    return url;
}

export function getDb() {
    if (!db) {
        const databaseUrl = getDatabaseUrl();

        client = postgres(databaseUrl, {
            max: process.env.NODE_ENV === 'production' ? 10 : 5,
        });
        db = drizzle(client);
    }

    return db;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthCheck> {
    const database = getDb();

    await database.execute(sql`select 1`);

    const tables = await Promise.all(
        healthCheckTables.map(async ({ name, table }) => {
            const result = await database.select({ count: sql<number>`count(*)` }).from(table);
            const rowCount = Number(result[0]?.count ?? 0);

            return {
                name,
                rowCount,
                hasData: rowCount > 0,
            };
        })
    );

    return {
        connected: true,
        healthy: tables.every((table) => table.hasData),
        tables,
    };
}

export async function closeDb() {
    if (client) {
        await client.end();
    }
}
