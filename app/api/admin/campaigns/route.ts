import { NextRequest, NextResponse } from 'next/server';
import { campaignAdminService } from '@/server/services/admin';
import { AdminCampaignFilterSchema, AdminCreateCampaignSchema } from '@/server/schemas/admin';
import { errorResponse, successResponse, validationError } from '@/server/utils/response';
import { requireAdmin } from '@/server/lib/session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const body = await request.json();
        const data = AdminCreateCampaignSchema.parse(body);
        const campaign = await campaignAdminService.createCampaign(data);
        return NextResponse.json(successResponse(campaign), { status: 201 });
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error creating campaign:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to create campaign'), { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const query = Object.fromEntries(new URL(request.url).searchParams);
        const filters = AdminCampaignFilterSchema.parse(query);
        const campaigns = await campaignAdminService.listCampaigns(
            filters.ngo_id,
            filters.status,
            filters.limit,
            filters.offset
        );
        return NextResponse.json(successResponse(campaigns));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error listing campaigns:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to list campaigns'), { status: 500 });
    }
}
