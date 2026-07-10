import { z } from 'zod';

// NGO Management
export const CreateNgoSchema = z.object({
    name: z.string().min(3, 'NGO name must be at least 3 characters'),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    logo_url: z.string().url().optional(),
    website: z.string().url().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
});

export const UpdateNgoSchema = CreateNgoSchema.partial();

export const AdminNgoUpdateSchema = UpdateNgoSchema.extend({
    verification_status: z.enum(['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED']).optional(),
    verification_notes: z.string().max(1000).optional(),
    archived: z.boolean().optional(),
});

export const NgoFilterSchema = z.object({
    status: z.enum(['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED']).optional(),
    search: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

// Campaign Management (Admin)
export const AdminCreateCampaignSchema = z.object({
    ngo_id: z.string().uuid('Invalid NGO ID'),
    title: z.string().min(5, 'Title must be at least 5 characters'),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    category: z.enum(['EDUCATION', 'HEALTHCARE', 'ANIMAL_WELFARE', 'ENVIRONMENT', 'HUNGER', 'WATER_SANITATION']).optional(),
    description: z.string().min(50, 'Description must be at least 50 characters').optional(),
    mobile_hero_image: z.string().url().optional(),
    desktop_hero_image: z.string().url().optional(),
    impact_highlights: z.array(z.string()).optional(),
    goal_amount: z.number().int().positive('Goal amount must be positive').optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional(),
});

export const AdminUpdateCampaignSchema = AdminCreateCampaignSchema.omit({ ngo_id: true }).partial();

export const AdminCampaignFilterSchema = z.object({
    ngo_id: z.string().uuid().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

// Support Tier Editor
export const CreateTierSchema = z.object({
    campaign_id: z.string().uuid('Invalid campaign ID'),
    title: z.string().min(3, 'Tier title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters').optional(),
    features: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    daily_amount: z.number().int().positive('Daily amount must be positive'),
    monthly_equivalent: z.number().int().positive('Monthly equivalent must be positive'),
    display_order: z.number().int().min(0).default(0),
});

export const UpdateTierSchema = CreateTierSchema.omit({ campaign_id: true }).partial();

export const TierFilterSchema = z.object({
    campaign_id: z.string().uuid('Invalid campaign ID'),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

// User Search
export const UserSearchSchema = z.object({
    email: z.string().email().optional(),
    name: z.string().min(2).optional(),
    status: z.enum(['active', 'suspended']).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

export const WalletAdjustmentSchema = z.object({
    type: z.enum(['credit', 'debit']),
    amount: z.coerce.number().int().positive('Amount must be positive'),
    reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export const UserSuspendSchema = z.object({
    suspended: z.boolean(),
    reason: z.string().min(5, 'Reason must be at least 5 characters').optional(),
});

export const DonationFilterSchema = z.object({
    ngo_id: z.string().uuid().optional(),
    campaign_id: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
});

export const LedgerFilterSchema = z.object({
    user_id: z.string().uuid().optional(),
    type: z.enum(['TOPUP', 'DONATION', 'REFUND', 'ADJUSTMENT']).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
});

export const TransparencyReportSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    file_url: z.string().url('File URL must be a valid URL'),
    report_type: z.string().min(3, 'Report type must be at least 3 characters'),
});

// Payout Workflow
export const PayoutSchema = z.object({
    ngo_id: z.string().uuid('Invalid NGO ID'),
    start_date: z.date().or(z.string().datetime()),
    end_date: z.date().or(z.string().datetime()),
});

export const PayoutListFilterSchema = z.object({
    ngo_id: z.string().uuid().optional(),
    status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
});

export const ApprovePayoutSchema = z.object({
    payout_id: z.string().uuid('Invalid payout ID'),
    notes: z.string().optional(),
});

export const ProcessPayoutSchema = z.object({
    payout_id: z.string().uuid('Invalid payout ID'),
    razorpay_transfer_id: z.string(),
    receipt_url: z.string().url().optional(),
});

export const DailyCronRunSchema = z.object({
    run_date: z.string().datetime().optional(),
    max_pledges: z.coerce.number().int().min(1).max(500).default(100),
});

export const RunMonthlyPayoutSchema = z.object({
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
}).refine((data) => {
    if (!data.start_date && !data.end_date) {
        return true;
    }

    return Boolean(data.start_date && data.end_date);
}, {
    message: 'start_date and end_date must both be provided together',
    path: ['start_date'],
});

export const JobRunListSchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});