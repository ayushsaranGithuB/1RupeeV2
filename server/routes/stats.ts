import { Hono } from 'hono';
import { campaignService } from '../services/campaign';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';
import { ApiStats } from '../types';
import { getDb } from '@db';
import { transparency_reports } from '@db/schema';
import { desc } from 'drizzle-orm';

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

        c.header('Cache-Control', 'public, max-age=60, s-maxage=300');
        return c.json(successResponse(stats));
    } catch (error) {
        console.error('Error fetching stats:', error);
        return c.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch stats'),
            500
        );
    }
});

// GET /stats/reports - Get latest transparency reports
stats.get('/reports', async (c) => {
    try {
        const db = getDb();
        const reports = await db
            .select()
            .from(transparency_reports)
            .orderBy(desc(transparency_reports.created_at))
            .limit(10);

        c.header('Cache-Control', 'public, max-age=300, s-maxage=3600');
        return c.json(successResponse(reports));
    } catch (error) {
        console.error('Error fetching transparency reports:', error);
        return c.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch transparency reports'),
            500
        );
    }
});

export default stats;
