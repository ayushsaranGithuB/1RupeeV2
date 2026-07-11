import { NextRequest, NextResponse } from 'next/server';
import { walletService } from '@/server/services/wallet';
import { successResponse, errorResponse, ErrorCodes } from '@/server/utils/response';
import { WalletTopupSchema } from '@/server/schemas/wallet';
import { requireUser } from '@/server/lib/session';

export const runtime = 'nodejs';

// POST /api/wallets/topup - Add funds to wallet
export async function POST(request: NextRequest) {
    const guard = await requireUser(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const body = await request.json();
        const parsed = WalletTopupSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid request body'),
                { status: 400 }
            );
        }

        const wallet = await walletService.topup(guard.auth.user.id, parsed.data);

        return NextResponse.json(successResponse(wallet));
    } catch (error) {
        console.error('Error topping up wallet:', error);
        return NextResponse.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to topup wallet'),
            { status: 500 }
        );
    }
}
