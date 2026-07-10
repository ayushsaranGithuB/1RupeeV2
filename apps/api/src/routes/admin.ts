import { Hono } from 'hono';
import { z } from 'zod';
import {
    AdminCampaignFilterSchema,
    AdminCreateCampaignSchema,
    AdminNgoUpdateSchema,
    AdminUpdateCampaignSchema,
    ApprovePayoutSchema,
    CreateNgoSchema,
    CreateTierSchema,
    DonationFilterSchema,
    LedgerFilterSchema,
    NgoFilterSchema,
    PayoutListFilterSchema,
    PayoutSchema,
    ProcessPayoutSchema,
    RunMonthlyPayoutSchema,
    DailyCronRunSchema,
    TierFilterSchema,
    TransparencyReportSchema,
    UpdateTierSchema,
    UserSearchSchema,
    UserSuspendSchema,
    WalletAdjustmentSchema,
} from '../schemas/admin';
import {
    adminReportingService,
    campaignAdminService,
    dailyDonationProcessorService,
    ngoService,
    payoutService,
    tierService,
    userSearchService,
} from '../services/admin';
import { errorResponse, successResponse } from '../utils/response';

const admin = new Hono();

function getAdminId(c: any) {
    return c.get('auth')?.user?.id || 'test-admin-id';
}

function validationError(error: unknown) {
    if (error instanceof z.ZodError) {
        return errorResponse('VALIDATION_ERROR', error.errors[0].message);
    }

    return null;
}

admin.get('/overview', async (c) => {
    try {
        const overview = await adminReportingService.getOverview();
        return c.json(successResponse(overview));
    } catch (error: any) {
        console.error('Error loading admin overview:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to load admin overview'), 500);
    }
});

// NGO Management
admin.post('/ngos', async (c) => {
    try {
        const body = await c.req.json();
        const data = CreateNgoSchema.parse(body);
        const ngo = await ngoService.createNgo(data);
        return c.json(successResponse(ngo), 201);
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
        }
        console.error('Error creating NGO:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to create NGO'), 500);
    }
});

admin.get('/ngos', async (c) => {
    try {
        const query = c.req.query();
        const filters = NgoFilterSchema.parse(query);
        const ngos = await ngoService.listNgos(filters.status, filters.search, filters.limit, filters.offset);
        return c.json(successResponse(ngos));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
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
        const data = AdminNgoUpdateSchema.parse(body);
        const ngo = await ngoService.updateNgo(c.req.param('id'), data);
        if (!ngo) {
            return c.json(errorResponse('NOT_FOUND', 'NGO not found'), 404);
        }
        return c.json(successResponse(ngo));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
        }
        console.error('Error updating NGO:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to update NGO'), 500);
    }
});

admin.post('/ngos/:id/verify', async (c) => {
    try {
        const body = await c.req.json().catch(() => ({}));
        const ngo = await ngoService.verifyNgo(c.req.param('id'), body?.verification_notes);
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
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
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
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
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
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
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
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
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
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
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
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
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
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
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

admin.get('/users/:id/profile', async (c) => {
    try {
        const profile = await userSearchService.getUserProfile(c.req.param('id'));
        if (!profile) {
            return c.json(errorResponse('NOT_FOUND', 'User not found'), 404);
        }
        return c.json(successResponse(profile));
    } catch (error: any) {
        console.error('Error fetching user profile:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to fetch user profile'), 500);
    }
});

admin.post('/users/:id/wallet-adjustments', async (c) => {
    try {
        const body = await c.req.json();
        const data = WalletAdjustmentSchema.parse(body);
        const profile = await userSearchService.adjustWallet(
            c.req.param('id'),
            getAdminId(c),
            data.type,
            data.amount,
            data.reason
        );

        if (!profile) {
            return c.json(errorResponse('NOT_FOUND', 'Wallet not found for user'), 404);
        }

        return c.json(successResponse(profile));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
        }
        console.error('Error adjusting wallet:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to adjust wallet'), 500);
    }
});

admin.post('/users/:id/suspend', async (c) => {
    try {
        const body = await c.req.json();
        const data = UserSuspendSchema.parse(body);
        const user = await userSearchService.setSuspended(
            c.req.param('id'),
            getAdminId(c),
            data.suspended,
            data.reason
        );

        if (!user) {
            return c.json(errorResponse('NOT_FOUND', 'User not found'), 404);
        }

        return c.json(successResponse(user));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
        }
        console.error('Error updating user status:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to update user status'), 500);
    }
});

admin.get('/donations', async (c) => {
    try {
        const query = c.req.query();
        const filters = DonationFilterSchema.parse(query);
        const results = await adminReportingService.listDonations({
            ngoId: filters.ngo_id,
            campaignId: filters.campaign_id,
            limit: filters.limit,
            offset: filters.offset,
        });
        return c.json(successResponse(results));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
        }
        console.error('Error listing donations:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to list donations'), 500);
    }
});

admin.get('/ledger', async (c) => {
    try {
        const query = c.req.query();
        const filters = LedgerFilterSchema.parse(query);
        const results = await adminReportingService.listLedger({
            userId: filters.user_id,
            type: filters.type,
            limit: filters.limit,
            offset: filters.offset,
        });
        return c.json(successResponse(results));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
        }
        console.error('Error loading ledger:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to load ledger'), 500);
    }
});

admin.get('/reports', async (c) => {
    try {
        const reports = await adminReportingService.listReports();
        return c.json(successResponse(reports));
    } catch (error: any) {
        console.error('Error loading reports:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to load reports'), 500);
    }
});

admin.post('/reports', async (c) => {
    try {
        const body = await c.req.json();
        const data = TransparencyReportSchema.parse(body);
        const report = await adminReportingService.createReport(data);
        return c.json(successResponse(report), 201);
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
        }
        console.error('Error creating report:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to create report'), 500);
    }
});

// CRON Jobs (admin-triggered manual run)
admin.post('/cron/daily-run', async (c) => {
    try {
        const body = await c.req.json().catch(() => ({}));
        const data = DailyCronRunSchema.parse(body);
        const summary = await dailyDonationProcessorService.runDailyProcessing(
            data.run_date ? new Date(data.run_date) : undefined,
            data.max_pledges
        );

        return c.json(successResponse(summary));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
        }

        console.error('Error running daily donation processing:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to run daily donation processing'), 500);
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
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
        }
        console.error('Error creating payout:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to create payout'), 500);
    }
});

admin.post('/payouts/run', async (c) => {
    try {
        const body = await c.req.json().catch(() => ({}));
        const data = RunMonthlyPayoutSchema.parse(body);
        const summary = await payoutService.runMonthlyPayoutGeneration(
            data.start_date ? new Date(data.start_date) : undefined,
            data.end_date ? new Date(data.end_date) : undefined
        );

        return c.json(successResponse(summary));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
        }

        console.error('Error running monthly payout generation:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to run monthly payout generation'), 500);
    }
});

admin.get('/payouts', async (c) => {
    try {
        const query = c.req.query();
        const filters = PayoutListFilterSchema.parse(query);
        const payoutList = await payoutService.listPayouts(
            filters.ngo_id,
            filters.status,
            filters.limit,
            filters.offset
        );
        return c.json(successResponse(payoutList));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
        }
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
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
        }
        console.error('Error approving payout:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to approve payout'), 500);
    }
});

admin.post('/payouts/:id/process', async (c) => {
    try {
        const body = await c.req.json();
        const data = ProcessPayoutSchema.parse(body);
        const payout = await payoutService.processPayout(
            c.req.param('id'),
            data.razorpay_transfer_id,
            data.receipt_url
        );
        if (!payout) {
            return c.json(errorResponse('NOT_FOUND', 'Payout not found'), 404);
        }
        return c.json(successResponse(payout));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return c.json(validation, 400);
        }
        console.error('Error processing payout:', error.message);
        return c.json(errorResponse('INTERNAL_ERROR', 'Failed to process payout'), 500);
    }
});

export default admin;