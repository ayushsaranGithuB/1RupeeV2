// One-off: apply a single SQL migration file using the simple query protocol
// (supports multiple statements + DO $$ blocks). Usage:
//   bun run scripts/apply-migration.ts db/migrations/0006_auth_tables.sql
import postgres from 'postgres';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function getDatabaseUrl(): string {
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
    for (const f of ['.env.local', 'apps/api/.env.local']) {
        try {
            const m = readFileSync(resolve(process.cwd(), f), 'utf8').match(/^DATABASE_URL=(.+)$/m);
            if (m?.[1]) return m[1].trim().replace(/^"|"$/g, '');
        } catch {
            /* ignore */
        }
    }
    throw new Error('DATABASE_URL not set');
}

const file = process.argv[2];
if (!file) throw new Error('Pass a migration file path');

const sqlText = readFileSync(resolve(process.cwd(), file), 'utf8');
const sql = postgres(getDatabaseUrl(), { max: 1 });

try {
    await sql.unsafe(sqlText).simple();
    console.log(`✅ Applied ${file}`);
} catch (error) {
    console.error(`❌ Failed to apply ${file}:`, error);
    process.exitCode = 1;
} finally {
    await sql.end();
}
