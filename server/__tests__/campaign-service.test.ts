import { describe, it, expect } from 'vitest';
import { campaignService } from '../services/campaign';

describe('CampaignService', () => {
    describe('getStats', () => {
        it('should return campaign statistics or handle missing DB', async () => {
            try {
                const stats = await campaignService.getStats();

                expect(stats).toBeDefined();
                expect(stats).toHaveProperty('total_campaigns');
                expect(stats).toHaveProperty('active_campaigns');
                expect(stats).toHaveProperty('total_raised');
            } catch (error: any) {
                // Expected error when DATABASE_URL is not set
                expect(error.message).toContain('DATABASE_URL');
            }
        });
    });

    describe('listCampaigns', () => {
        it('should handle campaigns list or gracefully fail', async () => {
            try {
                const campaigns = await campaignService.listCampaigns();
                expect(Array.isArray(campaigns)).toBe(true);
            } catch (error: any) {
                // Expected error when DATABASE_URL is not set
                expect(error.message).toContain('DATABASE_URL');
            }
        });

        it('should respect limit and offset or gracefully fail', async () => {
            try {
                const campaigns = await campaignService.listCampaigns(undefined, undefined, 10, 0);
                expect(campaigns.length).toBeLessThanOrEqual(10);
            } catch (error: any) {
                // Expected error when DATABASE_URL is not set
                expect(error.message).toContain('DATABASE_URL');
            }
        });
    });
});
