import { getDb } from '@db';
import { campaigns } from '@db/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { ApiCampaign } from '../types';

export class CampaignRepository {
    async findById(id: string): Promise<ApiCampaign | null> {
        const db = getDb();
        const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
        return (result[0] as any) || null;
    }

    async findBySlug(slug: string): Promise<ApiCampaign | null> {
        const db = getDb();
        const result = await db.select().from(campaigns).where(eq(campaigns.slug, slug)).limit(1);
        return (result[0] as any) || null;
    }

    async findMany(ngoId?: string, status?: string, limit = 20, offset = 0): Promise<ApiCampaign[]> {
        const db = getDb();
        const conditions = [isNull(campaigns.deleted_at)];

        if (ngoId) {
            conditions.push(eq(campaigns.ngo_id, ngoId));
        }
        if (status) {
            conditions.push(eq(campaigns.status, status as any));
        }

        const result = await db.select().from(campaigns)
            .where(and(...conditions))
            .limit(limit)
            .offset(offset);
        return (result as any) || [];
    }

    async create(data: {
        ngo_id: string;
        title: string;
        slug: string;
        short_description: string;
        description: string;
        hero_image?: string | null;
        goal_amount: number;
        status?: 'DRAFT' | 'ACTIVE';
    }): Promise<ApiCampaign> {
        const db = getDb();

        const campaign = await db.insert(campaigns).values({
            id: crypto.randomUUID(),
            ngo_id: data.ngo_id,
            title: data.title,
            slug: data.slug,
            short_description: data.short_description,
            description: data.description,
            hero_image: data.hero_image || null,
            goal_amount: data.goal_amount,
            status: (data.status || 'DRAFT') as any,
        }).returning();

        return (campaign[0] as any);
    }

    async update(id: string, data: {
        title?: string;
        short_description?: string;
        description?: string;
        hero_image?: string | null;
        status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
    }): Promise<ApiCampaign | null> {
        const db = getDb();
        const updated = await db.update(campaigns)
            .set({
                ...data,
                updated_at: new Date(),
            })
            .where(eq(campaigns.id, id))
            .returning();

        return (updated[0] as any) || null;
    }

    async getStats(): Promise<{
        total_campaigns: number;
        active_campaigns: number;
        total_raised: number;
    }> {
        const db = getDb();
        const result = await db.select({
            total: sql<number>`COUNT(*)`.mapWith(Number),
            active: sql<number>`SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END)`.mapWith(Number),
            raised: sql<number>`COALESCE(SUM(raised_amount), 0)`.mapWith(Number),
        }).from(campaigns)
            .where(isNull(campaigns.deleted_at));

        return {
            total_campaigns: result[0]?.total || 0,
            active_campaigns: result[0]?.active || 0,
            total_raised: result[0]?.raised || 0,
        };
    }
}

export const campaignRepository = new CampaignRepository();
