import { NextRequest, NextResponse } from 'next/server';
import { tierService } from '@/server/services/admin';
import { TierFilterSchema } from '@/server/schemas/admin';
import { errorResponse, successResponse, validationError } from '@/server/utils/response';
import { requireAdmin } from '@/server/lib/session';

export const runtime = 'nodejs';

// GET /api/admin/campaigns/:id/tiers
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const { id } = await params;
        const query = Object.fromEntries(new URL(request.url).searchParams);
        const filters = TierFilterSchema.parse({ campaign_id: id, ...query });
        const tiers = await tierService.listTiers(filters.campaign_id, filters.limit, filters.offset);
        return NextResponse.json(successResponse(tiers));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error listing tiers:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to list tiers'), { status: 500 });
    }
}
