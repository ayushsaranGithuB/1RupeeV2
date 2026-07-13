import { getDb } from '@db';
import { pledges, campaign_tiers, campaigns, donations, ngos } from '@db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { ApiPledge } from '../types';
import { generateUUID } from '../utils/id';

export class PledgeRepository {
    async findById(id: string): Promise<ApiPledge | null> {
        const db = getDb();
        const result = await db.select().from(pledges).where(eq(pledges.id, id)).limit(1);
        return (result[0] as any) || null;
    }

    async findByUserAndTier(userId: string, tierId: string): Promise<ApiPledge | null> {
        const db = getDb();
        const result = await db.select().from(pledges).where(and(
            eq(pledges.user_id, userId),
            eq(pledges.campaign_tier_id, tierId)
        )).limit(1);
        return (result[0] as any) || null;
    }

    async findManyByUser(userId: string, status?: string) {
        const db = getDb();
        const conditions = [eq(pledges.user_id, userId)];

        if (status) {
            conditions.push(eq(pledges.status, status as any));
        }

        const result = await db
            .select({
                id: pledges.id,
                status: pledges.status,
                started_at: pledges.started_at,
                paused_at: pledges.paused_at,
                cancelled_at: pledges.cancelled_at,
                campaign_tier_id: pledges.campaign_tier_id,
                campaign_id: campaign_tiers.campaign_id,
                campaign_title: campaigns.title,
                campaign_logo: campaigns.logo_url,
                tier_title: campaign_tiers.title,
                daily_amount: campaign_tiers.daily_amount,
                monthly_equivalent: campaign_tiers.monthly_equivalent,
                ngo_logo: ngos.logo_url,
            })
            .from(pledges)
            .innerJoin(campaign_tiers, eq(pledges.campaign_tier_id, campaign_tiers.id))
            .innerJoin(campaigns, eq(campaign_tiers.campaign_id, campaigns.id))
            .innerJoin(ngos, eq(campaigns.ngo_id, ngos.id))
            .where(and(...conditions));

        return (result as any) || [];
    }

    async create(userId: string, tierId: string, planLengthMonths: number = 1): Promise<ApiPledge> {
        const db = getDb();

        const pledge = await db.insert(pledges).values({
            id: generateUUID(),
            user_id: userId,
            campaign_tier_id: tierId,
            status: 'ACTIVE',
            started_at: new Date(),
            plan_length_months: planLengthMonths,
            updated_at: new Date(),
        }).returning();

        return (pledge[0] as any);
    }

    async updateStatus(id: string, status: 'ACTIVE' | 'PAUSED' | 'CANCELLED'): Promise<ApiPledge | null> {
        const db = getDb();
        const now = new Date();

        const data: any = {
            status,
            updated_at: now,
        };

        if (status === 'PAUSED') {
            data.paused_at = now;
        } else if (status === 'CANCELLED') {
            data.cancelled_at = now;
        }

        const updated = await db.update(pledges)
            .set(data)
            .where(eq(pledges.id, id))
            .returning();

        return (updated[0] as any) || null;
    }

    async findActiveForDailyProcessing(limit = 100) {
        const db = getDb();

        return db
            .select({
                pledge_id: pledges.id,
                user_id: pledges.user_id,
                campaign_id: campaign_tiers.campaign_id,
                daily_amount: campaign_tiers.daily_amount,
            })
            .from(pledges)
            .innerJoin(campaign_tiers, eq(pledges.campaign_tier_id, campaign_tiers.id))
            .innerJoin(campaigns, eq(campaign_tiers.campaign_id, campaigns.id))
            .where(and(
                eq(pledges.status, 'ACTIVE'),
                eq(campaigns.status, 'ACTIVE'),
            ))
            .limit(limit);
    }

    async createDonationRecord(data: {
        pledge_id: string;
        campaign_id: string;
        wallet_transaction_id: string;
        amount: number;
        donated_at: Date;
    }) {
        const db = getDb();

        const inserted = await db
            .insert(donations)
            .values({
                id: generateUUID(),
                pledge_id: data.pledge_id,
                campaign_id: data.campaign_id,
                wallet_transaction_id: data.wallet_transaction_id,
                amount: data.amount,
                donated_at: data.donated_at,
            })
            .returning();

        return (inserted[0] as any) || null;
    }

    async hasDonationForPledgeOnUtcDate(pledgeId: string, date: Date) {
        const db = getDb();
        const dayStart = new Date(Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            0,
            0,
            0,
            0
        ));
        const dayEnd = new Date(Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            23,
            59,
            59,
            999
        ));

        const existing = await db
            .select({ id: donations.id })
            .from(donations)
            .where(and(
                eq(donations.pledge_id, pledgeId),
                gte(donations.donated_at, dayStart),
                lte(donations.donated_at, dayEnd),
            ))
            .limit(1);

        return existing.length > 0;
    }
}

export const pledgeRepository = new PledgeRepository();
