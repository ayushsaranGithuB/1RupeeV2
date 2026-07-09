import { getDb } from '@db';
import { ngos, campaign_tiers, payouts } from '@db/schema';
import { eq, ilike, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export class NgoRepository {
    async findById(id: string) {
        const db = getDb();
        const result = await db.select().from(ngos).where(eq(ngos.id, id)).limit(1);
        return (result[0] as any) || null;
    }

    async findBySlug(slug: string) {
        const db = getDb();
        const result = await db.select().from(ngos).where(eq(ngos.slug, slug)).limit(1);
        return (result[0] as any) || null;
    }

    async findMany(status?: string, search?: string, limit = 20, offset = 0) {
        const db = getDb();
        const conditions = [];

        if (status) {
            conditions.push(eq(ngos.verification_status, status as any));
        }

        if (search) {
            conditions.push(ilike(ngos.name, `%${search}%`));
        }

        const q = db.select().from(ngos);
        const query = conditions.length > 0 ? q.where(and(...conditions)) : (q as any);

        const results = await (query as any).limit(limit).offset(offset);
        return results as any[];
    }

    async create(data: any) {
        const db = getDb();
        const id = randomUUID();
        const result = await db
            .insert(ngos)
            .values({
                id,
                name: data.name,
                slug: data.slug,
                description: data.description,
                logo_url: data.logo_url,
                website: data.website,
                email: data.email,
                phone: data.phone,
            })
            .returning();
        return (result[0] as any) || null;
    }

    async update(id: string, data: any) {
        const db = getDb();
        const result = await db
            .update(ngos)
            .set({
                ...(data.name && { name: data.name }),
                ...(data.slug && { slug: data.slug }),
                ...(data.description && { description: data.description }),
                ...(data.logo_url !== undefined && { logo_url: data.logo_url }),
                ...(data.website !== undefined && { website: data.website }),
                ...(data.email !== undefined && { email: data.email }),
                ...(data.phone !== undefined && { phone: data.phone }),
                ...(data.verification_status && { verification_status: data.verification_status as any }),
            })
            .where(eq(ngos.id, id))
            .returning();
        return (result[0] as any) || null;
    }
}

export class TierRepository {
    async findById(id: string) {
        const db = getDb();
        const result = await db.select().from(campaign_tiers).where(eq(campaign_tiers.id, id)).limit(1);
        return (result[0] as any) || null;
    }

    async findByCampaignId(campaignId: string, limit = 20, offset = 0) {
        const db = getDb();
        const results = await db
            .select()
            .from(campaign_tiers)
            .where(eq(campaign_tiers.campaign_id, campaignId))
            .limit(limit)
            .offset(offset);
        return results as any[];
    }

    async create(data: any) {
        const db = getDb();
        const id = randomUUID();
        const result = await db
            .insert(campaign_tiers)
            .values({
                id,
                campaign_id: data.campaign_id,
                title: data.title,
                description: data.description,
                impact_description: data.impact_description,
                daily_amount: data.daily_amount,
                monthly_equivalent: data.monthly_equivalent,
                display_order: data.display_order || 0,
            })
            .returning();
        return (result[0] as any) || null;
    }

    async update(id: string, data: any) {
        const db = getDb();
        const result = await db
            .update(campaign_tiers)
            .set({
                ...(data.title && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.impact_description !== undefined && { impact_description: data.impact_description }),
                ...(data.daily_amount && { daily_amount: data.daily_amount }),
                ...(data.monthly_equivalent && { monthly_equivalent: data.monthly_equivalent }),
                ...(data.display_order !== undefined && { display_order: data.display_order }),
                ...(data.active !== undefined && { active: data.active }),
            })
            .where(eq(campaign_tiers.id, id))
            .returning();
        return (result[0] as any) || null;
    }

    async delete(id: string) {
        const db = getDb();
        await db.delete(campaign_tiers).where(eq(campaign_tiers.id, id));
        return true;
    }
}

export class PayoutRepository {
    async findById(id: string) {
        const db = getDb();
        const result = await db.select().from(payouts).where(eq(payouts.id, id)).limit(1);
        return (result[0] as any) || null;
    }

    async findByNgoId(ngoId: string, limit = 20, offset = 0) {
        const db = getDb();
        const results = await db
            .select()
            .from(payouts)
            .where(eq(payouts.ngo_id, ngoId))
            .limit(limit)
            .offset(offset);
        return results as any[];
    }

    async findByStatus(status: string, limit = 20, offset = 0) {
        const db = getDb();
        const results = await db
            .select()
            .from(payouts)
            .where(eq(payouts.status, status as any))
            .limit(limit)
            .offset(offset);
        return results as any[];
    }

    async create(data: any) {
        const db = getDb();
        const id = randomUUID();
        const result = await db
            .insert(payouts)
            .values({
                id,
                ngo_id: data.ngo_id,
                period_start: data.period_start,
                period_end: data.period_end,
                total_amount: data.total_amount || 0,
                status: 'PENDING',
            })
            .returning();
        return (result[0] as any) || null;
    }

    async updateStatus(id: string, status: string, receiptUrl?: string) {
        const db = getDb();
        const result = await db
            .update(payouts)
            .set({
                status: status as any,
                ...(receiptUrl && { receipt_url: receiptUrl }),
                ...(status === 'COMPLETED' && { completed_at: new Date() }),
            })
            .where(eq(payouts.id, id))
            .returning();
        return (result[0] as any) || null;
    }

    async getLineItems(payoutId: string) {
        return [];
    }
}

export const ngoRepository = new NgoRepository();
export const tierRepository = new TierRepository();
export const payoutRepository = new PayoutRepository();
