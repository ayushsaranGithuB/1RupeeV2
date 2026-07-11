import { NextRequest, NextResponse } from 'next/server';
import { userSearchService } from '@/server/services/admin';
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
        const profile = await userSearchService.getUserProfile(id);
        if (!profile) {
            return NextResponse.json(errorResponse('NOT_FOUND', 'User not found'), { status: 404 });
        }
        return NextResponse.json(successResponse(profile));
    } catch (error: any) {
        console.error('Error fetching user profile:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to fetch user profile'), { status: 500 });
    }
}
