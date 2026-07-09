import { Hono } from 'hono';
import { campaignService } from '../services/campaign';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';
import { ApiStats } from '../types';

const stats = new Hono();

// GET /stats - Get platform stats
stats.get('/', async (c) => {
    try {
        const campaigns = await campaignService.getStats();

        // TODO: Get user stats from database
        const stats: ApiStats = {
            total_pledgers: 0,
            total_supporters: 0,
            total_raised: campaigns.total_raised,
            active_campaigns: campaigns.active_campaigns,
            verified_ngos: 0,
        };

        return c.json(successResponse(stats));
    } catch (error) {
        console.error('Error fetching stats:', error);
        return c.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch stats'),
            500
        );
    }
});

export default stats;
