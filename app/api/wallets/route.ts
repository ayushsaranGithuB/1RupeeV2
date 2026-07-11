import { NextRequest, NextResponse } from 'next/server';
import { walletService } from '@/server/services/wallet';
import { successResponse, errorResponse, ErrorCodes } from '@/server/utils/response';
import { requireUser } from '@/server/lib/session';

export const runtime = 'nodejs';

// GET /api/wallets - Get user's wallet
export async function GET(request: NextRequest) {
    const guard = await requireUser(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const wallet = await walletService.getWallet(guard.auth.user.id);

        if (!wallet) {
            return NextResponse.json(
                errorResponse(ErrorCodes.NOT_FOUND, 'Wallet not found'),
                { status: 404 }
            );
        }

        return NextResponse.json(successResponse(wallet));
    } catch (error) {
        console.error('Error fetching wallet:', error);
        return NextResponse.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch wallet'),
            { status: 500 }
        );
    }
}
