import { NextRequest, NextResponse } from 'next/server';
import { userSearchService } from '@/server/services/admin';
import { UserSuspendSchema } from '@/server/schemas/admin';
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
        const data = UserSuspendSchema.parse(body);
        const user = await userSearchService.setSuspended(
            id,
            guard.auth.user.id,
            data.suspended,
            data.reason
        );

        if (!user) {
            return NextResponse.json(errorResponse('NOT_FOUND', 'User not found'), { status: 404 });
        }

        return NextResponse.json(successResponse(user));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error updating user status:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to update user status'), { status: 500 });
    }
}
