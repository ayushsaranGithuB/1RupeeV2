import { NextRequest, NextResponse } from 'next/server';
import { campaignAdminService } from '@/server/services/admin';
import { AdminUpdateCampaignSchema } from '@/server/schemas/admin';
import { errorResponse, successResponse, validationError } from '@/server/utils/response';
import { requireAdmin } from '@/server/lib/session';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const { id } = await params;
        const campaign = await campaignAdminService.getCampaign(id);
        if (!campaign) {
            return NextResponse.json(errorResponse('NOT_FOUND', 'Campaign not found'), { status: 404 });
        }
        const stats = await campaignAdminService.getCampaignStats(campaign.id);
        return NextResponse.json(successResponse({ ...campaign, stats }));
    } catch (error: any) {
        console.error('Error fetching campaign:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to fetch campaign'), { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const data = AdminUpdateCampaignSchema.parse(body);
        const campaign = await campaignAdminService.updateCampaign(id, data);
        if (!campaign) {
            return NextResponse.json(errorResponse('NOT_FOUND', 'Campaign not found'), { status: 404 });
        }
        return NextResponse.json(successResponse(campaign));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error updating campaign:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to update campaign'), { status: 500 });
    }
}
