import { campaignRepository } from '../repositories/campaign';
import { ApiCampaign, ApiCampaignTier } from '../types';
import { CreateCampaign, UpdateCampaign } from '../schemas/campaign';

export type ApiCampaignWithTiers = ApiCampaign & { tiers: ApiCampaignTier[] };

export class CampaignService {
    async getCampaign(id: string): Promise<ApiCampaign | null> {
        return campaignRepository.findById(id);
    }

    async getCampaignBySlug(slug: string): Promise<ApiCampaignWithTiers | null> {
        const campaign = await campaignRepository.findBySlug(slug);
        if (!campaign) {
            return null;
        }

        const tiers = await campaignRepository.findActiveTiers(campaign.id);
        return { ...campaign, tiers };
    }

    async listCampaigns(ngoId?: string, status?: string, limit?: number, offset?: number, category?: string) {
        return campaignRepository.findMany(ngoId, status, limit, offset, category);
    }

    async createCampaign(data: CreateCampaign): Promise<ApiCampaign> {
        // Validate slug uniqueness
        const existing = await campaignRepository.findBySlug(data.slug);
        if (existing) {
            throw new Error('SLUG_ALREADY_EXISTS');
        }

        return campaignRepository.create(data);
    }

    async updateCampaign(id: string, data: UpdateCampaign): Promise<ApiCampaign | null> {
        const campaign = await campaignRepository.findById(id);
        if (!campaign) {
            return null;
        }

        return campaignRepository.update(id, data);
    }

    async getStats() {
        return campaignRepository.getStats();
    }
}

export const campaignService = new CampaignService();
