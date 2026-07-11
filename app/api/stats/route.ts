import { NextResponse } from 'next/server';
import { campaignService } from '@/server/services/campaign';
import { successResponse, errorResponse, ErrorCodes } from '@/server/utils/response';
import { ApiStats } from '@/server/types';

export const runtime = 'nodejs';

// GET /api/stats - Get platform stats
export async function GET() {
    try {
        const campaigns = await campaignService.getStats();

        // TODO: Get user stats from database
        const stats: ApiStats = {
            total_pledgers: 0,
            total_supporters: 0,
            total_raised: campaigns.total_raised,
            active_campaigns: campaigns.active_campaigns,
            verified_ngos: 0,
        };

        return NextResponse.json(successResponse(stats), {
            headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' },
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch stats'),
            { status: 500 }
        );
    }
}
