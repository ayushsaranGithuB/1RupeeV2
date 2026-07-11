import { Hono } from 'hono';
import { campaignService } from '../services/campaign';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';
import { CampaignFilterSchema } from '../schemas/campaign';

const campaigns = new Hono();

// GET /campaigns - List all campaigns
campaigns.get('/', async (c) => {
    try {
        const query = c.req.query();
        const parsed = CampaignFilterSchema.safeParse(query);

        if (!parsed.success) {
            return c.json(
                errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid query parameters'),
                400
            );
        }

        const result = await campaignService.listCampaigns(
            parsed.data.ngo_id,
            parsed.data.status,
            parsed.data.limit,
            parsed.data.offset,
            parsed.data.category
        );

        c.header('Cache-Control', 'public, max-age=60, s-maxage=300');
        return c.json(successResponse(result));
    } catch (error) {
        console.error('Error listing campaigns:', error);
        return c.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to list campaigns'),
            500
        );
    }
});

// GET /campaigns/:slug - Get campaign by slug
campaigns.get('/:slug', async (c) => {
    try {
        const slug = c.req.param('slug');
        const campaign = await campaignService.getCampaignBySlug(slug);

        if (!campaign) {
            return c.json(
                errorResponse(ErrorCodes.NOT_FOUND, 'Campaign not found'),
                404
            );
        }

        c.header('Cache-Control', 'public, max-age=60, s-maxage=300');
        return c.json(successResponse(campaign));
    } catch (error) {
        console.error('Error fetching campaign:', error);
        return c.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch campaign'),
            500
        );
    }
});

export default campaigns;
