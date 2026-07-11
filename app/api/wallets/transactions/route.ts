import { NextRequest, NextResponse } from 'next/server';
import { walletService } from '@/server/services/wallet';
import { successResponse, errorResponse, ErrorCodes } from '@/server/utils/response';
import { requireUser } from '@/server/lib/session';

export const runtime = 'nodejs';

// GET /api/wallets/transactions - Get wallet transactions
export async function GET(request: NextRequest) {
    const guard = await requireUser(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const query = new URL(request.url).searchParams;
        const limit = Math.min(parseInt(query.get('limit') || '50'), 100);
        const offset = parseInt(query.get('offset') || '0');

        const transactions = await walletService.getTransactions(guard.auth.user.id, limit, offset);

        return NextResponse.json(successResponse(transactions));
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch transactions'),
            { status: 500 }
        );
    }
}
