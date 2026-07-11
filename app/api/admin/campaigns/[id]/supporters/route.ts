import { NextRequest, NextResponse } from 'next/server';
import { errorResponse, successResponse } from '@/server/utils/response';
import { requireAdmin } from '@/server/lib/session';
import { getDb } from '@db';
import { pledges, users, campaign_tiers, donations } from '@db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export const runtime = 'nodejs';

// GET /api/admin/campaigns/:id/supporters
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const { id: campaignId } = await params;
        const db = getDb();

        // Get all pledges for this campaign with supporter info
        const supporters = await db
            .select({
                user_id: pledges.user_id,
                user_name: users.name,
                tier_title: campaign_tiers.title,
                total_contribution: sql<number>`SUM(${donations.amount})`,
                donation_count: sql<number>`COUNT(${donations.id})`,
            })
            .from(pledges)
            .innerJoin(users, eq(pledges.user_id, users.id))
            .innerJoin(campaign_tiers, eq(pledges.campaign_tier_id, campaign_tiers.id))
            .leftJoin(donations, eq(pledges.id, donations.pledge_id))
            .where(eq(campaign_tiers.campaign_id, campaignId))
            .groupBy(pledges.user_id, users.name, campaign_tiers.title)
            .orderBy(desc(sql`SUM(${donations.amount})`));

        return NextResponse.json(successResponse(supporters));
    } catch (error: any) {
        console.error('Error fetching campaign supporters:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to fetch supporters'), { status: 500 });
    }
}
