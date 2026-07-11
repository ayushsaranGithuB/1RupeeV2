import { NextRequest, NextResponse } from 'next/server';
import { userSearchService } from '@/server/services/admin';
import { WalletAdjustmentSchema } from '@/server/schemas/admin';
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
        const data = WalletAdjustmentSchema.parse(body);
        const profile = await userSearchService.adjustWallet(
            id,
            guard.auth.user.id,
            data.type,
            data.amount,
            data.reason
        );

        if (!profile) {
            return NextResponse.json(errorResponse('NOT_FOUND', 'Wallet not found for user'), { status: 404 });
        }

        return NextResponse.json(successResponse(profile));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error adjusting wallet:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to adjust wallet'), { status: 500 });
    }
}
