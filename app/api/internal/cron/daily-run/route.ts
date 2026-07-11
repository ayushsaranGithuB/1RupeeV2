import { NextRequest, NextResponse } from 'next/server';
import { dailyDonationProcessorService } from '@/server/services/admin';
import { successResponse, errorResponse } from '@/server/utils/response';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Machine-to-machine cron endpoint, guarded by a secret header (constant-time compare).
// Called by the GitHub Actions scheduled workflow at 00:00 IST daily.
export async function POST(request: NextRequest) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        console.error('[CRON] CRON_SECRET not set');
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Cron not configured'), { status: 500 });
    }

    const provided = request.headers.get('X-Cron-Secret');
    if (!provided) {
        console.warn('[CRON] Missing X-Cron-Secret header');
        return NextResponse.json(errorResponse('UNAUTHORIZED', 'Missing X-Cron-Secret header'), { status: 401 });
    }

    // Constant-time comparison to prevent timing attacks
    const match = provided.length === cronSecret.length &&
        provided.split('').every((char, i) => char === cronSecret[i]);

    if (!match) {
        console.warn('[CRON] Invalid X-Cron-Secret');
        return NextResponse.json(errorResponse('UNAUTHORIZED', 'Invalid X-Cron-Secret'), { status: 401 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const runDate = body.run_date ? new Date(body.run_date) : undefined;
        const maxPledges = body.max_pledges || 100;

        console.log('[CRON] Running daily donation processing', {
            runDate: runDate?.toISOString() || 'today',
            maxPledges,
        });

        // SYSTEM is a sentinel user ID for automated jobs
        const summary = await dailyDonationProcessorService.runDailyProcessing(
            'SYSTEM',
            runDate,
            maxPledges
        );

        console.log('[CRON] Daily processing complete', summary);
        return NextResponse.json(successResponse(summary));
    } catch (error: any) {
        console.error('[CRON] Error running daily processing:', error.message);
        return NextResponse.json(
            errorResponse('INTERNAL_ERROR', 'Failed to run daily processing'),
            { status: 500 }
        );
    }
}
