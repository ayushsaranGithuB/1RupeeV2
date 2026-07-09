import { pledgeRepository } from '../repositories/pledge';
import { walletRepository } from '../repositories/user';
import { CreatePledge, UpdatePledgeStatus } from '../schemas/pledge';

export class PledgeService {
    async getPledge(id: string) {
        return pledgeRepository.findById(id);
    }

    async listUserPledges(userId: string, status?: string) {
        return pledgeRepository.findManyByUser(userId, status);
    }

    async createPledge(userId: string, data: CreatePledge) {
        // Check if pledge already exists
        const existing = await pledgeRepository.findByUserAndTier(userId, data.campaign_tier_id);
        if (existing) {
            throw new Error('PLEDGE_ALREADY_EXISTS');
        }

        return pledgeRepository.create(userId, data.campaign_tier_id);
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
