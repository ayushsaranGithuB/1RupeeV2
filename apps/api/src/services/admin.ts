import { ngoRepository, tierRepository, payoutRepository } from '../repositories/admin';
import { campaignRepository } from '../repositories/campaign';
import { pledgeRepository } from '../repositories/pledge';
import { userRepository } from '../repositories/user';

export class NgoService {
    async getNgo(id: string) {
        return ngoRepository.findById(id);
    }

    async listNgos(status?: string, search?: string, limit?: number, offset?: number) {
        console.log('🎯 [NgoService.listNgos] Called with:', { status, search, limit, offset });
        const result = await ngoRepository.findMany(status, search, limit, offset);
        console.log('✅ [NgoService.listNgos] Returning:', result);
        return result;
    }

    async createNgo(data: {
        name: string;
        slug: string;
        description: string;
        logo_url?: string;
        website?: string;
    }) {
        return ngoRepository.create(data);
    }

    async updateNgo(id: string, data: any) {
        return ngoRepository.update(id, data);
    }

    async verifyNgo(id: string) {
        return ngoRepository.update(id, { verification_status: 'VERIFIED' });
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
        const searchResults = await userRepository.search(
            email,
            name,
            status,
            limit || 20,
            offset || 0
        );
        return searchResults;
    }

    async getUserDetails(userId: string) {
        return userRepository.findById(userId);
    }

    async suspendUser(userId: string) {
        return userRepository.findById(userId);
    }
}

export class PayoutService {
    async generatePayout(ngoId: string, startDate: Date, endDate: Date) {
        // Calculate total pledges for the period
        const payout = await payoutRepository.create({
            ngo_id: ngoId,
            period_start: startDate,
            period_end: endDate,
            total_amount: 0, // Will be calculated from pledges
        });

        return payout;
    }

    async approvePayout(payoutId: string, notes?: string) {
        return payoutRepository.updateStatus(payoutId, 'PENDING', undefined);
    }

    async processPayout(payoutId: string, razorpayTransferId: string) {
        return payoutRepository.updateStatus(payoutId, 'COMPLETED', undefined);
    }

    async getPayoutDetails(payoutId: string) {
        const payout = await payoutRepository.findById(payoutId);
        if (!payout) return null;

        const lineItems = await payoutRepository.getLineItems(payoutId);

        return {
            ...payout,
            line_items: lineItems,
            item_count: lineItems.length,
        };
    }

    async listPayouts(ngoId: string, limit?: number, offset?: number) {
        return payoutRepository.findByNgoId(ngoId, limit, offset);
    }

    async listPendingPayouts(limit = 20, offset = 0) {
        return payoutRepository.findByStatus('PENDING', limit, offset);
    }
}

export const ngoService = new NgoService();
export const campaignAdminService = new CampaignAdminService();
export const tierService = new TierService();
export const userSearchService = new UserSearchService();
export const payoutService = new PayoutService();
