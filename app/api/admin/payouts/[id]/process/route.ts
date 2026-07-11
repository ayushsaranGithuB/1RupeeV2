import { NextRequest, NextResponse } from 'next/server';
import { payoutService } from '@/server/services/admin';
import { ProcessPayoutSchema } from '@/server/schemas/admin';
import { errorResponse, successResponse, validationError } from '@/server/utils/response';
import { requireAdmin } from '@/server/lib/session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const data = ProcessPayoutSchema.parse(body);
        const payout = await payoutService.processPayout(
            id,
            data.razorpay_transfer_id,
            data.receipt_url
        );
        if (!payout) {
            return NextResponse.json(errorResponse('NOT_FOUND', 'Payout not found'), { status: 404 });
        }
        return NextResponse.json(successResponse(payout));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error processing payout:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to process payout'), { status: 500 });
    }
}
