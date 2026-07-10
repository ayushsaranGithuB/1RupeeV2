import { getDb } from '@db';
import { users, wallets, wallet_transactions, pledges, campaign_tiers, campaigns, donations } from '@db/schema';
import { eq, and, desc, ilike } from 'drizzle-orm';
import { ApiUser, ApiWallet } from '../types';

export class UserRepository {
    async findById(id: string): Promise<ApiUser | null> {
        const db = getDb();
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return (result[0] as any) || null;
    }

    async findByEmail(email: string): Promise<ApiUser | null> {
        const db = getDb();
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return (result[0] as any) || null;
    }

    async search(
        email?: string,
        name?: string,
        status?: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<{ users: ApiUser[]; total: number }> {
        const db = getDb();
        const conditions: any[] = [];

        if (email) {
            conditions.push(ilike(users.email, `%${email}%`));
        }
        if (name) {
            conditions.push(ilike(users.name, `%${name}%`));
        }
        if (status) {
            conditions.push(eq(users.status, status as any));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const results = await db
            .select()
            .from(users)
            .where(whereClause)
            .limit(limit)
            .offset(offset);

        const allResults = await db
            .select()
            .from(users)
            .where(whereClause);

        const total = allResults.length;

        return {
            users: (results as any[]) || [],
            total,
        };
    }

    async updateStatus(userId: string, status: 'active' | 'suspended') {
        const db = getDb();
        const result = await db
            .update(users)
            .set({
                status,
                updated_at: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        return (result[0] as any) || null;
    }

    async getAdminProfile(userId: string) {
        const db = getDb();
        const user = await this.findById(userId);
        if (!user) {
            return null;
        }

        const wallet = await db
            .select()
            .from(wallets)
            .where(eq(wallets.user_id, userId))
            .limit(1);

        const walletRecord = (wallet[0] as any) || null;

        const transactions = walletRecord
            ? await db
                .select()
                .from(wallet_transactions)
                .where(eq(wallet_transactions.wallet_id, walletRecord.id))
                .orderBy(desc(wallet_transactions.created_at))
                .limit(50)
            : [];

        const pledgeRows = await db
            .select({
                id: pledges.id,
                status: pledges.status,
                started_at: pledges.started_at,
                paused_at: pledges.paused_at,
                cancelled_at: pledges.cancelled_at,
                tier_id: campaign_tiers.id,
                tier_title: campaign_tiers.title,
                daily_amount: campaign_tiers.daily_amount,
                campaign_id: campaigns.id,
                campaign_title: campaigns.title,
            })
            .from(pledges)
            .innerJoin(campaign_tiers, eq(pledges.campaign_tier_id, campaign_tiers.id))
            .innerJoin(campaigns, eq(campaign_tiers.campaign_id, campaigns.id))
            .where(eq(pledges.user_id, userId))
            .orderBy(desc(pledges.started_at));

        const donationRows = await db
            .select({
                id: donations.id,
                amount: donations.amount,
                donated_at: donations.donated_at,
                campaign_id: campaigns.id,
                campaign_title: campaigns.title,
            })
            .from(donations)
            .innerJoin(pledges, eq(donations.pledge_id, pledges.id))
            .innerJoin(campaigns, eq(donations.campaign_id, campaigns.id))
            .where(eq(pledges.user_id, userId))
            .orderBy(desc(donations.donated_at))
            .limit(50);

        return {
            user,
            wallet: walletRecord,
            transactions,
            pledges: pledgeRows,
            donations: donationRows,
        };
    }
}

export class WalletRepository {
    async findByUserId(userId: string): Promise<ApiWallet | null> {
        const db = getDb();
        const result = await db.select().from(wallets).where(eq(wallets.user_id, userId)).limit(1);
        return (result[0] as any) || null;
    }

    async addTransaction(
        walletId: string,
        type: 'TOPUP' | 'DONATION' | 'REFUND' | 'ADJUSTMENT',
        amount: number,
        description: string,
        referenceId?: string | null
    ): Promise<string> {
        const db = getDb();

        const inserted = await db.insert(wallet_transactions).values({
            id: crypto.randomUUID(),
            wallet_id: walletId,
            type: type as any,
            amount,
            reference_id: referenceId || null,
            description,
        }).returning({ id: wallet_transactions.id });

        const wallet = await db.select().from(wallets).where(eq(wallets.id, walletId)).limit(1);
        if (wallet[0]) {
            const currentBalance = (wallet[0] as any).cached_balance;
            await db.update(wallets)
                .set({
                    cached_balance: currentBalance + amount,
                    updated_at: new Date(),
                })
                .where(eq(wallets.id, walletId));
        }

        return inserted[0]?.id as string;
    }

    async getBalance(walletId: string): Promise<number | null> {
        const db = getDb();
        const result = await db.select().from(wallets).where(eq(wallets.id, walletId)).limit(1);
        return (result[0] as any)?.cached_balance || null;
    }

    async getTransactions(walletId: string, limit = 50, offset = 0) {
        const db = getDb();
        return db.select()
            .from(wallet_transactions)
            .where(eq(wallet_transactions.wallet_id, walletId))
            .orderBy(desc(wallet_transactions.created_at))
            .limit(limit)
            .offset(offset);
    }
}
export const userRepository = new UserRepository();
export const walletRepository = new WalletRepository();