import { getDb } from '@db';
import { campaigns, campaign_tiers, ngos } from '@db/schema';
import { eq, and, isNull, asc, sql } from 'drizzle-orm';
import { ApiCampaign, ApiCampaignTier } from '../types';
import { generateUUID } from '../utils/id';

export class CampaignRepository {
    async findById(id: string): Promise<ApiCampaign | null> {
        const db = getDb();
        const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
        return (result[0] as any) || null;
    }

    async findBySlug(slug: string): Promise<ApiCampaign | null> {
        const db = getDb();
        const result = await db
            .select()
            .from(campaigns)
            .leftJoin(ngos, eq(campaigns.ngo_id, ngos.id))
            .where(eq(campaigns.slug, slug))
            .limit(1);
        if (!result[0]) {
            return null;
        }
        return { ...result[0].campaigns, ngo_name: result[0].ngos?.name ?? null } as any;
    }

    async findActiveTiers(campaignId: string): Promise<ApiCampaignTier[]> {
        const db = getDb();
        const result = await db
            .select()
            .from(campaign_tiers)
            .where(and(eq(campaign_tiers.campaign_id, campaignId), eq(campaign_tiers.active, true)))
            .orderBy(asc(campaign_tiers.display_order));
        return result as any;
    }

    async findMany(ngoId?: string, status?: string, limit = 20, offset = 0, category?: string): Promise<ApiCampaign[]> {
        const db = getDb();
        const conditions = [isNull(campaigns.deleted_at)];

        if (ngoId) {
            conditions.push(eq(campaigns.ngo_id, ngoId));
        }
        if (status) {
            conditions.push(eq(campaigns.status, status as any));
        }
        if (category) {
            conditions.push(eq(campaigns.category, category as any));
        }

        const result = await db
            .select()
            .from(campaigns)
            .leftJoin(ngos, eq(campaigns.ngo_id, ngos.id))
            .where(and(...conditions))
            .limit(limit)
            .offset(offset);
        return result.map((row) => ({
            ...row.campaigns,
            ngo_name: row.ngos?.name ?? null,
        })) as any;
    }

    async create(data: {
        ngo_id: string;
        title: string;
        slug: string;
        category?: string | null;
        description: string;
        mobile_hero_image?: string | null;
        desktop_hero_image?: string | null;
        logo_url?: string | null;
        impact_highlights?: string[] | null;
        goal_amount: number;
        status?: 'DRAFT' | 'ACTIVE';
    }): Promise<ApiCampaign> {
        const db = getDb();

        const campaign = await db.insert(campaigns).values({
            id: generateUUID(),
            ngo_id: data.ngo_id,
            title: data.title,
            slug: data.slug,
            category: (data.category ?? null) as any,
            description: data.description,
            mobile_hero_image: data.mobile_hero_image || null,
            desktop_hero_image: data.desktop_hero_image || null,
            logo_url: data.logo_url || null,
            impact_highlights: data.impact_highlights ?? null,
            goal_amount: data.goal_amount,
            status: (data.status || 'DRAFT') as any,
        }).returning();

        return (campaign[0] as any);
    }

    async update(id: string, data: {
        title?: string;
        category?: string | null;
        description?: string;
        mobile_hero_image?: string | null;
        desktop_hero_image?: string | null;
        logo_url?: string | null;
        impact_highlights?: string[] | null;
        status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
    }): Promise<ApiCampaign | null> {
        const db = getDb();
        const updated = await db.update(campaigns)
            .set({
                ...data,
                category: data.category as any,
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
