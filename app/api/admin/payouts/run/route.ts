import { NextRequest, NextResponse } from 'next/server';
import { payoutService } from '@/server/services/admin';
import { RunMonthlyPayoutSchema } from '@/server/schemas/admin';
import { errorResponse, successResponse, validationError } from '@/server/utils/response';
import { requireAdmin } from '@/server/lib/session';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const body = await request.json().catch(() => ({}));
        const data = RunMonthlyPayoutSchema.parse(body);
        const summary = await payoutService.runMonthlyPayoutGeneration(
            guard.auth.user.id,
            data.start_date ? new Date(data.start_date) : undefined,
            data.end_date ? new Date(data.end_date) : undefined
        );

        return NextResponse.json(successResponse(summary));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }

        console.error('Error running monthly payout generation:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to run monthly payout generation'), { status: 500 });
    }
}
