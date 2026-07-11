import { NextRequest, NextResponse } from 'next/server';
import { payoutService } from '@/server/services/admin';
import { errorResponse, successResponse } from '@/server/utils/response';
import { requireAdmin } from '@/server/lib/session';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const { id } = await params;
        const payout = await payoutService.getPayoutDetails(id);
        if (!payout) {
            return NextResponse.json(errorResponse('NOT_FOUND', 'Payout not found'), { status: 404 });
        }
        return NextResponse.json(successResponse(payout));
    } catch (error: any) {
        console.error('Error fetching payout:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to fetch payout'), { status: 500 });
    }
}
