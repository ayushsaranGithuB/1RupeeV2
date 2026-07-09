import { getDb } from '@db';
import {
    audit_logs,
    campaigns,
    donations,
    ngos,
    pledges,
    transparency_reports,
    users,
    wallets,
    wallet_transactions,
} from '@db/schema';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { ngoRepository, payoutRepository, tierRepository } from '../repositories/admin';
import { campaignRepository } from '../repositories/campaign';
import { userRepository, walletRepository } from '../repositories/user';

export class NgoService {
    async getNgo(id: string) {
        return ngoRepository.findById(id);
    }

    async listNgos(status?: string, search?: string, limit?: number, offset?: number) {
        return ngoRepository.findMany(status, search, limit, offset);
    }

    async createNgo(data: {
        name: string;
        slug: string;
        description: string;
        logo_url?: string;
        website?: string;
        email?: string;
        phone?: string;
        verification_notes?: string;
    }) {
        return ngoRepository.create(data);
    }

    async updateNgo(id: string, data: any) {
        return ngoRepository.update(id, data);
    }

    async verifyNgo(id: string, verificationNotes?: string) {
        return ngoRepository.update(id, {
            verification_status: 'VERIFIED',
            verification_notes: verificationNotes,
        });
    }
}

export class CampaignAdminService {
    async getCampaign(id: string) {
        return campaignRepository.findById(id);
    }

    async listCampaigns(ngoId?: string, status?: string, limit?: number, offset?: number) {
        return campaignRepository.findMany(ngoId, status, limit, offset);
    }

    async createCampaign(data: any) {
        return campaignRepository.create(data);
    }

    async updateCampaign(id: string, data: any) {
        return campaignRepository.update(id, data);
    }

    async getCampaignStats(campaignId: string) {
        const campaign = await campaignRepository.findById(campaignId);
        if (!campaign) return null;

        return {
            id: campaign.id,
            title: campaign.title,
            goal_amount: campaign.goal_amount,
            raised_amount: campaign.raised_amount,
            supporter_count: campaign.supporter_count,
            progress: campaign.goal_amount ? Math.round((campaign.raised_amount / campaign.goal_amount) * 100) : 0,
        };
    }
}

export class TierService {
    async getTier(id: string) {
        return tierRepository.findById(id);
    }

    async listTiers(campaignId: string, limit?: number, offset?: number) {
        return tierRepository.findByCampaignId(campaignId, limit, offset);
    }

    async createTier(data: any) {
        return tierRepository.create(data);
    }

    async updateTier(id: string, data: any) {
        return tierRepository.update(id, data);
    }

    async deleteTier(id: string) {
        return tierRepository.delete(id);
    }
}

export class UserSearchService {
    async searchUsers(email?: string, name?: string, status?: string, limit?: number, offset?: number) {
        return userRepository.search(
            email,
            name,
            status,
            limit || 20,
            offset || 0,
        );
    }

    async getUserDetails(userId: string) {
        return userRepository.findById(userId);
    }

    async getUserProfile(userId: string) {
        return userRepository.getAdminProfile(userId);
    }

    async adjustWallet(userId: string, adminId: string, type: 'credit' | 'debit', amount: number, reason: string) {
        const wallet = await walletRepository.findByUserId(userId);
        if (!wallet) {
            return null;
        }

        const signedAmount = type === 'debit' ? amount * -1 : amount;
        await walletRepository.addTransaction(wallet.id, 'ADJUSTMENT', signedAmount, reason, null);

        const db = getDb();
        await db.insert(audit_logs).values({
            id: crypto.randomUUID(),
            admin_id: adminId,
            user_id: userId,
            action: type === 'debit' ? 'WALLET_DEBIT' : 'WALLET_CREDIT',
            amount: signedAmount,
            reason,
        });

        return userRepository.getAdminProfile(userId);
    }

    async setSuspended(userId: string, adminId: string, suspended: boolean, reason?: string) {
        const updatedUser = await userRepository.updateStatus(userId, suspended ? 'suspended' : 'active');
        if (!updatedUser) {
            return null;
        }

        const db = getDb();
        await db.insert(audit_logs).values({
            id: crypto.randomUUID(),
            admin_id: adminId,
            user_id: userId,
            action: suspended ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
            reason: reason || (suspended ? 'Suspended by admin' : 'Reactivated by admin'),
        });

        return updatedUser;
    }
}

export class PayoutService {
    async generatePayout(ngoId: string, startDate: Date, endDate: Date) {
        const db = getDb();
        const [totals] = await db
            .select({
                total_amount: sql<number>`COALESCE(SUM(${donations.amount}), 0)`.mapWith(Number),
            })
            .from(donations)
            .innerJoin(campaigns, eq(donations.campaign_id, campaigns.id))
            .where(and(
                eq(campaigns.ngo_id, ngoId),
                gte(donations.donated_at, startDate),
                lte(donations.donated_at, endDate),
            ));

        return payoutRepository.create({
            ngo_id: ngoId,
            period_start: startDate,
            period_end: endDate,
            total_amount: totals?.total_amount || 0,
        });
    }

    async approvePayout(payoutId: string, _notes?: string) {
        return payoutRepository.updateStatus(payoutId, 'PROCESSING', undefined);
    }

    async processPayout(payoutId: string, _razorpayTransferId: string, receiptUrl?: string) {
        return payoutRepository.updateStatus(payoutId, 'COMPLETED', receiptUrl);
    }

    async getPayoutDetails(payoutId: string) {
        const payout = await payoutRepository.findById(payoutId);
        if (!payout) return null;

        const db = getDb();
        const lineItems = await db
            .select({
                campaign_id: campaigns.id,
                campaign_title: campaigns.title,
                total_amount: sql<number>`COALESCE(SUM(${donations.amount}), 0)`.mapWith(Number),
                donation_count: sql<number>`COUNT(${donations.id})`.mapWith(Number),
            })
            .from(donations)
            .innerJoin(campaigns, eq(donations.campaign_id, campaigns.id))
            .where(and(
                eq(campaigns.ngo_id, payout.ngo_id),
                gte(donations.donated_at, new Date(payout.period_start)),
                lte(donations.donated_at, new Date(payout.period_end)),
            ))
            .groupBy(campaigns.id, campaigns.title);

        return {
            ...payout,
            line_items: lineItems,
            item_count: lineItems.length,
        };
    }

    async listPayouts(ngoId?: string, status?: string, limit?: number, offset?: number) {
        return payoutRepository.findMany({ ngoId, status, limit, offset });
    }
}

export class AdminReportingService {
    async getOverview() {
        const db = getDb();

        const [userTotals, pledgeTotals, donationTotals, walletTotals, campaignTotals, ngoTotals] = await Promise.all([
            db.select({ total: sql<number>`COUNT(*)`.mapWith(Number) }).from(users),
            db.select({
                active_pledges: sql<number>`SUM(CASE WHEN ${pledges.status} = 'ACTIVE' THEN 1 ELSE 0 END)`.mapWith(Number),
                active_donors: sql<number>`COUNT(DISTINCT CASE WHEN ${pledges.status} = 'ACTIVE' THEN ${pledges.user_id} END)`.mapWith(Number),
            }).from(pledges),
            db.select({ total_amount: sql<number>`COALESCE(SUM(${donations.amount}), 0)`.mapWith(Number) }).from(donations),
            db.select({ total_balance: sql<number>`COALESCE(SUM(${wallets.cached_balance}), 0)`.mapWith(Number) }).from(wallets),
            db.select({ active_campaigns: sql<number>`SUM(CASE WHEN ${campaigns.status} = 'ACTIVE' THEN 1 ELSE 0 END)`.mapWith(Number) }).from(campaigns),
            db.select({ pending_ngos: sql<number>`SUM(CASE WHEN ${ngos.verification_status} = 'PENDING' AND ${ngos.deleted_at} IS NULL THEN 1 ELSE 0 END)`.mapWith(Number) }).from(ngos),
        ]);

        return {
            total_users: userTotals[0]?.total || 0,
            active_donors: pledgeTotals[0]?.active_donors || 0,
            active_pledges: pledgeTotals[0]?.active_pledges || 0,
            total_donation_volume: donationTotals[0]?.total_amount || 0,
            wallet_balance_across_platform: walletTotals[0]?.total_balance || 0,
            active_campaigns: campaignTotals[0]?.active_campaigns || 0,
            pending_ngo_applications: ngoTotals[0]?.pending_ngos || 0,
        };
    }

    async listDonations(filters: { ngoId?: string; campaignId?: string; limit?: number; offset?: number }) {
        const db = getDb();
        const conditions = [];

        if (filters.ngoId) {
            conditions.push(eq(campaigns.ngo_id, filters.ngoId));
        }

        if (filters.campaignId) {
            conditions.push(eq(donations.campaign_id, filters.campaignId));
        }

        const query = db
            .select({
                id: donations.id,
                amount: donations.amount,
                donated_at: donations.donated_at,
                campaign_id: campaigns.id,
                campaign_title: campaigns.title,
                ngo_id: ngos.id,
                ngo_name: ngos.name,
                user_id: users.id,
                user_name: users.name,
                user_email: users.email,
            })
            .from(donations)
            .innerJoin(campaigns, eq(donations.campaign_id, campaigns.id))
            .innerJoin(ngos, eq(campaigns.ngo_id, ngos.id))
            .innerJoin(pledges, eq(donations.pledge_id, pledges.id))
            .innerJoin(users, eq(pledges.user_id, users.id));

        const rows = conditions.length > 0
            ? await (query.where(and(...conditions)) as any)
                .orderBy(desc(donations.donated_at))
                .limit(filters.limit ?? 50)
                .offset(filters.offset ?? 0)
            : await (query as any)
                .orderBy(desc(donations.donated_at))
                .limit(filters.limit ?? 50)
                .offset(filters.offset ?? 0);

        return rows;
    }

    async listLedger(filters: { userId?: string; type?: string; limit?: number; offset?: number }) {
        const db = getDb();
        const conditions = [];

        if (filters.userId) {
            conditions.push(eq(wallets.user_id, filters.userId));
        }

        if (filters.type) {
            conditions.push(eq(wallet_transactions.type, filters.type as any));
        }

        const query = db
            .select({
                id: wallet_transactions.id,
                created_at: wallet_transactions.created_at,
                type: wallet_transactions.type,
                amount: wallet_transactions.amount,
                description: wallet_transactions.description,
                user_id: users.id,
                user_name: users.name,
                user_email: users.email,
            })
            .from(wallet_transactions)
            .innerJoin(wallets, eq(wallet_transactions.wallet_id, wallets.id))
            .innerJoin(users, eq(wallets.user_id, users.id));

        const rows = conditions.length > 0
            ? await (query.where(and(...conditions)) as any)
                .orderBy(desc(wallet_transactions.created_at))
                .limit(filters.limit ?? 50)
                .offset(filters.offset ?? 0)
            : await (query as any)
                .orderBy(desc(wallet_transactions.created_at))
                .limit(filters.limit ?? 50)
                .offset(filters.offset ?? 0);

        return rows;
    }

    async listReports() {
        const db = getDb();
        return db
            .select()
            .from(transparency_reports)
            .orderBy(desc(transparency_reports.created_at));
    }

    async createReport(data: { title: string; file_url: string; report_type: string }) {
        const db = getDb();
        const result = await db
            .insert(transparency_reports)
            .values({
                id: crypto.randomUUID(),
                title: data.title,
                file_url: data.file_url,
                report_type: data.report_type,
            })
            .returning();

        return (result[0] as any) || null;
    }
}

export const ngoService = new NgoService();
export const campaignAdminService = new CampaignAdminService();
export const tierService = new TierService();
export const userSearchService = new UserSearchService();
export const payoutService = new PayoutService();
export const adminReportingService = new AdminReportingService();