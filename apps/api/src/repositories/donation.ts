import { getDb } from '@db';
import { donations, campaigns, ngos, pledges, campaign_tiers } from '@db/schema';
import { eq, desc, and } from 'drizzle-orm';

export class DonationRepository {
    async findManyByUser(userId: string, limit = 50, offset = 0) {
        const db = getDb();

        // Only show daily donations (where amount equals daily_amount of the tier)
        // This filters out upfront pledge charges which show the full amount for one day
        return db
            .select({
                id: donations.id,
                amount: donations.amount,
                donated_at: donations.donated_at,
                campaign_id: campaigns.id,
                campaign_title: campaigns.title,
                ngo_name: ngos.name,
            })
            .from(donations)
            .innerJoin(campaigns, eq(donations.campaign_id, campaigns.id))
            .innerJoin(ngos, eq(campaigns.ngo_id, ngos.id))
            .innerJoin(pledges, eq(donations.pledge_id, pledges.id))
            .innerJoin(campaign_tiers, eq(pledges.campaign_tier_id, campaign_tiers.id))
            // Filter: only show donations where amount equals daily_amount (daily CRON donations)
            // This excludes the old upfront pledge charges which were the full amount
            .where(and(
                eq(pledges.user_id, userId),
                eq(donations.amount, campaign_tiers.daily_amount)
            ))
            .orderBy(desc(donations.donated_at))
            .limit(limit)
            .offset(offset);
    }
}

export const donationRepository = new DonationRepository();
