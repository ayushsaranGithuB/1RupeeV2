import { NextRequest, NextResponse } from 'next/server';
import { campaignService } from '@/server/services/campaign';
import { successResponse, errorResponse, ErrorCodes } from '@/server/utils/response';

export const runtime = 'nodejs';

// GET /api/campaigns/:slug - Get campaign by slug
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const campaign = await campaignService.getCampaignBySlug(slug);

        if (!campaign) {
            return NextResponse.json(
                errorResponse(ErrorCodes.NOT_FOUND, 'Campaign not found'),
                { status: 404 }
            );
        }

        return NextResponse.json(successResponse(campaign), {
            headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' },
        });
    } catch (error) {
        console.error('Error fetching campaign:', error);
        return NextResponse.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch campaign'),
            { status: 500 }
        );
    }
}
