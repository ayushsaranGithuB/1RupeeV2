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
    short_description: z.string().min(10, 'Short description must be at least 10 characters').optional(),
    description: z.string().min(50, 'Description must be at least 50 characters').optional(),
    hero_image: z.string().url().optional(),
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
    impact_description: z.string().optional(),
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

// Payout Workflow
export const PayoutSchema = z.object({
    ngo_id: z.string().uuid('Invalid NGO ID'),
    start_date: z.date().or(z.string().datetime()),
    end_date: z.date().or(z.string().datetime()),
});

export const ApprovePayoutSchema = z.object({
    payout_id: z.string().uuid('Invalid payout ID'),
    notes: z.string().optional(),
});

export const ProcessPayoutSchema = z.object({
    payout_id: z.string().uuid('Invalid payout ID'),
    razorpay_transfer_id: z.string(),
});
