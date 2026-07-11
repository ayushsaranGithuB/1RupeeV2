import { NextRequest, NextResponse } from 'next/server';
import { donationService } from '@/server/services/donation';
import { successResponse, errorResponse, ErrorCodes } from '@/server/utils/response';
import { requireUser } from '@/server/lib/session';

export const runtime = 'nodejs';

// GET /api/donations - List the current user's donation history
export async function GET(request: NextRequest) {
    const guard = await requireUser(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const query = new URL(request.url).searchParams;
        const limit = Math.min(parseInt(query.get('limit') || '50'), 100);
        const offset = parseInt(query.get('offset') || '0');

        const donationsList = await donationService.listUserDonations(guard.auth.user.id, limit, offset);

        return NextResponse.json(successResponse(donationsList));
    } catch (error) {
        console.error('Error listing donations:', error);
        return NextResponse.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to list donations'),
            { status: 500 }
        );
    }
}
