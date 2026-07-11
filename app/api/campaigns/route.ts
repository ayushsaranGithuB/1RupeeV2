import { NextRequest, NextResponse } from 'next/server';
import { campaignService } from '@/server/services/campaign';
import { successResponse, errorResponse, ErrorCodes } from '@/server/utils/response';
import { CampaignFilterSchema } from '@/server/schemas/campaign';

export const runtime = 'nodejs';

// GET /api/campaigns - List all campaigns
export async function GET(request: NextRequest) {
    try {
        const query = Object.fromEntries(new URL(request.url).searchParams);
        const parsed = CampaignFilterSchema.safeParse(query);

        if (!parsed.success) {
            return NextResponse.json(
                errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid query parameters'),
                { status: 400 }
            );
        }

        const result = await campaignService.listCampaigns(
            parsed.data.ngo_id,
            parsed.data.status,
            parsed.data.limit,
            parsed.data.offset,
            parsed.data.category
        );

        return NextResponse.json(successResponse(result), {
            headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' },
        });
    } catch (error) {
        console.error('Error listing campaigns:', error);
        return NextResponse.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to list campaigns'),
            { status: 500 }
        );
    }
}
