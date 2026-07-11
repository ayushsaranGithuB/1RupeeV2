import { NextRequest, NextResponse } from 'next/server';
import { payoutService } from '@/server/services/admin';
import { ApprovePayoutSchema } from '@/server/schemas/admin';
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
        const data = ApprovePayoutSchema.parse(body);
        const payout = await payoutService.approvePayout(id, data.notes);
        if (!payout) {
            return NextResponse.json(errorResponse('NOT_FOUND', 'Payout not found'), { status: 404 });
        }
        return NextResponse.json(successResponse(payout));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error approving payout:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to approve payout'), { status: 500 });
    }
}
