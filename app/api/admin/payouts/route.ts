import { NextRequest, NextResponse } from 'next/server';
import { payoutService } from '@/server/services/admin';
import { PayoutListFilterSchema, PayoutSchema } from '@/server/schemas/admin';
import { errorResponse, successResponse, validationError } from '@/server/utils/response';
import { requireAdmin } from '@/server/lib/session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const body = await request.json();
        const data = PayoutSchema.parse(body);
        const payout = await payoutService.generatePayout(
            data.ngo_id,
            new Date(data.start_date),
            new Date(data.end_date)
        );
        return NextResponse.json(successResponse(payout), { status: 201 });
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error creating payout:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to create payout'), { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const query = Object.fromEntries(new URL(request.url).searchParams);
        const filters = PayoutListFilterSchema.parse(query);
        const payoutList = await payoutService.listPayouts(
            filters.ngo_id,
            filters.status,
            filters.limit,
            filters.offset
        );
        return NextResponse.json(successResponse(payoutList));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error listing payouts:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to list payouts'), { status: 500 });
    }
}
