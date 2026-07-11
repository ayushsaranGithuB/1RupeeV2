import { NextRequest, NextResponse } from 'next/server';
import { jobRunService } from '@/server/services/admin';
import { JobRunListSchema } from '@/server/schemas/admin';
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
        const filters = JobRunListSchema.parse(query);
        const runs = await jobRunService.listRuns(filters.limit, filters.offset);
        return NextResponse.json(successResponse(runs));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }

        console.error('Error listing job runs:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to list job runs'), { status: 500 });
    }
}
