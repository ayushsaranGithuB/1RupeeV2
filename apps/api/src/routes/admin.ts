import { Hono } from 'hono';
import { z } from 'zod';
import {
    CreateNgoSchema,
    UpdateNgoSchema,
    NgoFilterSchema,
    AdminCreateCampaignSchema,
    AdminUpdateCampaignSchema,
    AdminCampaignFilterSchema,
    CreateTierSchema,
    UpdateTierSchema,
    TierFilterSchema,
    UserSearchSchema,
    PayoutSchema,
    ApprovePayoutSchema,
    ProcessPayoutSchema,
} from '../schemas/admin';
import {
    ngoService,
    campaignAdminService,
    tierService,
    userSearchService,
    payoutService,
} from '../services/admin';
import { successResponse, errorResponse } from '../utils/response';

const admin = new Hono();

// NGO Management
admin.post('/ngos', async (c) => {
    try {
        const body = await c.req.json();
        const data = CreateNgoSchema.parse(body);
        const ngo = await ngoService.createNgo(data);
        return c.json(successResponse(ngo), 201);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return c.json(
                errorResponse('VALIDATION_ERROR', error.errors[0].message),
                400
            );
        }
        console.error('Error creating NGO:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to create NGO'), 500);
    }
});

admin.get('/ngos', async (c) => {
    try {
        console.log('📍 [admin.get /ngos] Route handler called');
        const query = c.req.query();
        console.log('📝 [admin.get /ngos] Query params:', query);
        const filters = NgoFilterSchema.parse(query);
        console.log('✅ [admin.get /ngos] Filters parsed:', filters);
        const ngos = await ngoService.listNgos(filters.status, filters.search, filters.limit, filters.offset);
        console.log('📤 [admin.get /ngos] Returning NGOs count:', ngos.length);
        return c.json(successResponse(ngos));
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return c.json(errorResponse('VALIDATION_ERROR', error.errors[0].message), 400);
        }
        console.error('Error listing NGOs:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to list NGOs'), 500);
    }
});

admin.get('/ngos/:id', async (c) => {
    try {
        const ngo = await ngoService.getNgo(c.req.param('id'));
        if (!ngo) {
            return c.json(errorResponse('NOT_FOUND', 'NGO not found'), 404);
        }
        return c.json(successResponse(ngo));
    } catch (error: any) {
        console.error('Error fetching NGO:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to fetch NGO'), 500);
    }
});

admin.patch('/ngos/:id', async (c) => {
    try {
        const body = await c.req.json();
        const data = UpdateNgoSchema.parse(body);
        const ngo = await ngoService.updateNgo(c.req.param('id'), data);
        if (!ngo) {
            return c.json(errorResponse('NOT_FOUND', 'NGO not found'), 404);
        }
        return c.json(successResponse(ngo));
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return c.json(errorResponse('VALIDATION_ERROR', error.errors[0].message), 400);
        }
        console.error('Error updating NGO:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to update NGO'), 500);
    }
});

admin.post('/ngos/:id/verify', async (c) => {
    try {
        const ngo = await ngoService.verifyNgo(c.req.param('id'));
        if (!ngo) {
            return c.json(errorResponse('NOT_FOUND', 'NGO not found'), 404);
        }
        return c.json(successResponse(ngo));
    } catch (error: any) {
        console.error('Error verifying NGO:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to verify NGO'), 500);
    }
});

// Campaign Management (Admin)
admin.post('/campaigns', async (c) => {
    try {
        const body = await c.req.json();
        const data = AdminCreateCampaignSchema.parse(body);
        const campaign = await campaignAdminService.createCampaign(data);
        return c.json(successResponse(campaign), 201);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return c.json(errorResponse('VALIDATION_ERROR', error.errors[0].message), 400);
        }
        console.error('Error creating campaign:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to create campaign'), 500);
    }
});

admin.get('/campaigns', async (c) => {
    try {
        const query = c.req.query();
        const filters = AdminCampaignFilterSchema.parse(query);
        const campaigns = await campaignAdminService.listCampaigns(
            filters.ngo_id,
            filters.status,
            filters.limit,
            filters.offset
        );
        return c.json(successResponse(campaigns));
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return c.json(errorResponse('VALIDATION_ERROR', error.errors[0].message), 400);
        }
        console.error('Error listing campaigns:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to list campaigns'), 500);
    }
});

admin.get('/campaigns/:id', async (c) => {
    try {
        const campaign = await campaignAdminService.getCampaign(c.req.param('id'));
        if (!campaign) {
            return c.json(errorResponse('NOT_FOUND', 'Campaign not found'), 404);
        }
        const stats = await campaignAdminService.getCampaignStats(campaign.id);
        return c.json(successResponse({ ...campaign, stats }));
    } catch (error: any) {
        console.error('Error fetching campaign:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to fetch campaign'), 500);
    }
});

admin.patch('/campaigns/:id', async (c) => {
    try {
        const body = await c.req.json();
        const data = AdminUpdateCampaignSchema.parse(body);
        const campaign = await campaignAdminService.updateCampaign(c.req.param('id'), data);
        if (!campaign) {
            return c.json(errorResponse('NOT_FOUND', 'Campaign not found'), 404);
        }
        return c.json(successResponse(campaign));
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return c.json(errorResponse('VALIDATION_ERROR', error.errors[0].message), 400);
        }
        console.error('Error updating campaign:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to update campaign'), 500);
    }
});

// Support Tier Editor
admin.post('/tiers', async (c) => {
    try {
        const body = await c.req.json();
        const data = CreateTierSchema.parse(body);
        const tier = await tierService.createTier(data);
        return c.json(successResponse(tier), 201);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return c.json(errorResponse('VALIDATION_ERROR', error.errors[0].message), 400);
        }
        console.error('Error creating tier:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to create tier'), 500);
    }
});

admin.get('/campaigns/:campaignId/tiers', async (c) => {
    try {
        const query = c.req.query();
        const filters = TierFilterSchema.parse({ campaign_id: c.req.param('campaignId'), ...query });
        const tiers = await tierService.listTiers(filters.campaign_id, filters.limit, filters.offset);
        return c.json(successResponse(tiers));
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return c.json(errorResponse('VALIDATION_ERROR', error.errors[0].message), 400);
        }
        console.error('Error listing tiers:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to list tiers'), 500);
    }
});

admin.get('/tiers/:id', async (c) => {
    try {
        const tier = await tierService.getTier(c.req.param('id'));
        if (!tier) {
            return c.json(errorResponse('NOT_FOUND', 'Tier not found'), 404);
        }
        return c.json(successResponse(tier));
    } catch (error: any) {
        console.error('Error fetching tier:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to fetch tier'), 500);
    }
});

admin.patch('/tiers/:id', async (c) => {
    try {
        const body = await c.req.json();
        const data = UpdateTierSchema.parse(body);
        const tier = await tierService.updateTier(c.req.param('id'), data);
        if (!tier) {
            return c.json(errorResponse('NOT_FOUND', 'Tier not found'), 404);
        }
        return c.json(successResponse(tier));
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return c.json(errorResponse('VALIDATION_ERROR', error.errors[0].message), 400);
        }
        console.error('Error updating tier:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to update tier'), 500);
    }
});

admin.delete('/tiers/:id', async (c) => {
    try {
        await tierService.deleteTier(c.req.param('id'));
        return c.json(successResponse({ success: true }));
    } catch (error: any) {
        console.error('Error deleting tier:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to delete tier'), 500);
    }
});

// User Search
admin.get('/users/search', async (c) => {
    try {
        const query = c.req.query();
        const filters = UserSearchSchema.parse(query);
        const results = await userSearchService.searchUsers(
            filters.email,
            filters.name,
            filters.status,
            filters.limit,
            filters.offset
        );
        return c.json(successResponse(results));
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return c.json(errorResponse('VALIDATION_ERROR', error.errors[0].message), 400);
        }
        console.error('Error searching users:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to search users'), 500);
    }
});

admin.get('/users/:id', async (c) => {
    try {
        const user = await userSearchService.getUserDetails(c.req.param('id'));
        if (!user) {
            return c.json(errorResponse('NOT_FOUND', 'User not found'), 404);
        }
        return c.json(successResponse(user));
    } catch (error: any) {
        console.error('Error fetching user:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to fetch user'), 500);
    }
});

// Payout Workflow
admin.post('/payouts', async (c) => {
    try {
        const body = await c.req.json();
        const data = PayoutSchema.parse(body);
        const payout = await payoutService.generatePayout(
            data.ngo_id,
            new Date(data.start_date),
            new Date(data.end_date)
        );
        return c.json(successResponse(payout), 201);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return c.json(errorResponse('VALIDATION_ERROR', error.errors[0].message), 400);
        }
        console.error('Error creating payout:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to create payout'), 500);
    }
});

admin.get('/payouts', async (c) => {
    try {
        const pending = await payoutService.listPendingPayouts();
        return c.json(successResponse(pending));
    } catch (error: any) {
        console.error('Error listing payouts:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to list payouts'), 500);
    }
});

admin.get('/payouts/:id', async (c) => {
    try {
        const payout = await payoutService.getPayoutDetails(c.req.param('id'));
        if (!payout) {
            return c.json(errorResponse('NOT_FOUND', 'Payout not found'), 404);
        }
        return c.json(successResponse(payout));
    } catch (error: any) {
        console.error('Error fetching payout:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to fetch payout'), 500);
    }
});

admin.post('/payouts/:id/approve', async (c) => {
    try {
        const body = await c.req.json();
        const data = ApprovePayoutSchema.parse(body);
        const payout = await payoutService.approvePayout(c.req.param('id'), data.notes);
        if (!payout) {
            return c.json(errorResponse('NOT_FOUND', 'Payout not found'), 404);
        }
        return c.json(successResponse(payout));
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return c.json(errorResponse('VALIDATION_ERROR', error.errors[0].message), 400);
        }
        console.error('Error approving payout:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to approve payout'), 500);
    }
});

admin.post('/payouts/:id/process', async (c) => {
    try {
        const body = await c.req.json();
        const data = ProcessPayoutSchema.parse(body);
        const payout = await payoutService.processPayout(c.req.param('id'), data.razorpay_transfer_id);
        if (!payout) {
            return c.json(errorResponse('NOT_FOUND', 'Payout not found'), 404);
        }
        return c.json(successResponse(payout));
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return c.json(errorResponse('VALIDATION_ERROR', error.errors[0].message), 400);
        }
        console.error('Error processing payout:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to process payout'), 500);
    }
});

export default admin;
