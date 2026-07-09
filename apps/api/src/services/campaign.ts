import { campaignRepository } from '../repositories/campaign';
import { ApiCampaign } from '../types';
import { CreateCampaign, UpdateCampaign } from '../schemas/campaign';

export class CampaignService {
    async getCampaign(id: string): Promise<ApiCampaign | null> {
        return campaignRepository.findById(id);
    }

    async getCampaignBySlug(slug: string): Promise<ApiCampaign | null> {
        return campaignRepository.findBySlug(slug);
    }

    async listCampaigns(ngoId?: string, status?: string, limit?: number, offset?: number) {
        return campaignRepository.findMany(ngoId, status, limit, offset);
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
