import { getDb } from '@db';
import { donations, campaigns, ngos, pledges } from '@db/schema';
import { eq, desc } from 'drizzle-orm';

export class DonationRepository {
    async findManyByUser(userId: string, limit = 50, offset = 0) {
        const db = getDb();

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
            .where(eq(pledges.user_id, userId))
            .orderBy(desc(donations.donated_at))
            .limit(limit)
            .offset(offset);
    }
}

export const donationRepository = new DonationRepository();
