import { NextRequest, NextResponse } from 'next/server';
import { userSearchService } from '@/server/services/admin';
import { UserSearchSchema } from '@/server/schemas/admin';
import { errorResponse, successResponse, validationError } from '@/server/utils/response';
import { requireAdmin } from '@/server/lib/session';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const query = Object.fromEntries(new URL(request.url).searchParams);
        const filters = UserSearchSchema.parse(query);
        const results = await userSearchService.searchUsers(
            filters.email,
            filters.name,
            filters.status,
            filters.limit,
            filters.offset
        );
        return NextResponse.json(successResponse(results));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error searching users:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to search users'), { status: 500 });
    }
}
