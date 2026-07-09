import { getDb } from '@db';
import { pledges } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import { ApiPledge } from '../types';

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

        const result = await db.select().from(pledges).where(and(...conditions));
        return (result as any) || [];
    }

    async create(userId: string, tierId: string): Promise<ApiPledge> {
        const db = getDb();

        const pledge = await db.insert(pledges).values({
            id: crypto.randomUUID(),
            user_id: userId,
            campaign_tier_id: tierId,
            status: 'ACTIVE',
            started_at: new Date(),
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
}

export const pledgeRepository = new PledgeRepository();
