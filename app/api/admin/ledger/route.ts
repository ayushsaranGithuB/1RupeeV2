import { NextRequest, NextResponse } from 'next/server';
import { adminReportingService } from '@/server/services/admin';
import { LedgerFilterSchema } from '@/server/schemas/admin';
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
        const filters = LedgerFilterSchema.parse(query);
        const results = await adminReportingService.listLedger({
            userId: filters.user_id,
            type: filters.type,
            limit: filters.limit,
            offset: filters.offset,
        });
        return NextResponse.json(successResponse(results));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error loading ledger:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to load ledger'), { status: 500 });
    }
}
