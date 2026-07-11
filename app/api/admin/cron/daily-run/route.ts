import { NextRequest, NextResponse } from 'next/server';
import { dailyDonationProcessorService } from '@/server/services/admin';
import { DailyCronRunSchema } from '@/server/schemas/admin';
import { errorResponse, successResponse, validationError } from '@/server/utils/response';
import { requireAdmin } from '@/server/lib/session';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST /api/admin/cron/daily-run - admin-triggered manual run (distinct from
// the secret-guarded /api/internal/cron/daily-run used by the GitHub Actions schedule).
export async function POST(request: NextRequest) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const body = await request.json().catch(() => ({}));
        const data = DailyCronRunSchema.parse(body);
        const summary = await dailyDonationProcessorService.runDailyProcessing(
            guard.auth.user.id,
            data.run_date ? new Date(data.run_date) : undefined,
            data.max_pledges
        );

        return NextResponse.json(successResponse(summary));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }

        console.error('Error running daily donation processing:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to run daily donation processing'), { status: 500 });
    }
}
