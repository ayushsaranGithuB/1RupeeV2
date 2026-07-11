import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@db';

export const runtime = 'nodejs';

// GET /api/health - used by the admin System Status page.
export async function GET() {
    try {
        const dbHealth = await checkDatabaseHealth();
        const status = dbHealth.healthy ? 'ok' : 'degraded';

        return NextResponse.json(
            {
                status,
                timestamp: new Date().toISOString(),
                database: dbHealth,
            },
            { status: dbHealth.healthy ? 200 : 503 }
        );
    } catch (error) {
        console.error('Health check failed:', error);

        return NextResponse.json(
            {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                database: {
                    connected: false,
                    healthy: false,
                    tables: [],
                },
            },
            { status: 503 }
        );
    }
}
