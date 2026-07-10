import { pledgeRepository } from '../repositories/pledge';
import { walletRepository } from '../repositories/user';
import { CreatePledge, UpdatePledgeStatus } from '../schemas/pledge';
import { getDb } from '@db';
import { campaign_tiers } from '@db/schema';
import { eq } from 'drizzle-orm';

export class PledgeService {
    async getPledge(id: string) {
        return pledgeRepository.findById(id);
    }

    async listUserPledges(userId: string, status?: string) {
        return pledgeRepository.findManyByUser(userId, status);
    }

    async createPledge(userId: string, data: CreatePledge) {
        const db = getDb();

        // Validate tier exists
        const [tier] = await db.select().from(campaign_tiers).where(eq(campaign_tiers.id, data.campaign_tier_id)).limit(1);
        if (!tier) {
            throw new Error('TIER_NOT_FOUND');
        }

        // Check if pledge already exists (only ACTIVE pledges block creation)
        const existing = await pledgeRepository.findByUserAndTier(userId, data.campaign_tier_id);
        if (existing && existing.status === 'ACTIVE') {
            throw new Error('PLEDGE_ALREADY_EXISTS');
        }

        // Calculate total amount to charge (first month's full pledge amount)
        const daysInPlan = data.plan_length_months * 30; // Simplified; could be calendar-aware
        const totalAmountToCharge = tier.daily_amount * daysInPlan;

        // Get user wallet
        const wallet = await walletRepository.findByUserId(userId);
        if (!wallet) {
            throw new Error('WALLET_NOT_FOUND');
        }

        // Check balance
        if (wallet.cached_balance < totalAmountToCharge) {
            throw new Error(`INSUFFICIENT_BALANCE:${totalAmountToCharge - wallet.cached_balance}`);
        }

        // Create pledge
        const pledge = await pledgeRepository.create(userId, data.campaign_tier_id, data.plan_length_months);

        // Deduct from wallet and log transaction (addTransaction handles balance update)
        const transactionId = await walletRepository.addTransaction(
            wallet.id,
            'DONATION',
            -totalAmountToCharge, // Negative for deduction
            `Pledge to ${tier.title} (${data.plan_length_months} months)`,
            data.reference_id
        );

        // Create donation record for first month
        await pledgeRepository.createDonationRecord({
            pledge_id: pledge.id,
            campaign_id: tier.campaign_id,
            wallet_transaction_id: transactionId,
            amount: totalAmountToCharge,
            donated_at: new Date(),
        });

        return {
            pledge: {
                ...pledge,
                campaign_title: tier.title, // Will be fetched properly from the join
                tier_title: tier.title,
                daily_amount: tier.daily_amount,
            },
            transaction: {
                id: transactionId,
                amount: -totalAmountToCharge,
                type: 'DONATION',
                description: `Pledge to ${tier.title} (${data.plan_length_months} months)`,
            },
            wallet_balance_after: wallet.cached_balance - totalAmountToCharge,
        };
    }

    async updatePledge(id: string, userId: string, data: UpdatePledgeStatus) {
        const pledge = await pledgeRepository.findById(id);
        if (!pledge || pledge.user_id !== userId) {
            throw new Error('PLEDGE_NOT_FOUND');
        }

        return pledgeRepository.updateStatus(id, data.status);
    }
}

export const pledgeService = new PledgeService();
