import { z } from 'zod';

export const CampaignFilterSchema = z.object({
    ngo_id: z.string().uuid().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

export const CreateCampaignSchema = z.object({
    ngo_id: z.string().uuid(),
    title: z.string().min(5).max(255),
    slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/),
    short_description: z.string().min(10).max(500),
    description: z.string().min(20),
    hero_image: z.string().url().optional(),
    mobile_hero_image: z.string().url().optional(),
    tablet_hero_image: z.string().url().optional(),
    desktop_hero_image: z.string().url().optional(),
    goal_amount: z.number().int().positive(),
    status: z.enum(['DRAFT', 'ACTIVE']).default('DRAFT'),
});

export const UpdateCampaignSchema = z.object({
    title: z.string().min(5).max(255).optional(),
    short_description: z.string().min(10).max(500).optional(),
    description: z.string().min(20).optional(),
    hero_image: z.string().url().optional(),
    mobile_hero_image: z.string().url().optional(),
    tablet_hero_image: z.string().url().optional(),
    desktop_hero_image: z.string().url().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional(),
});

export type CampaignFilter = z.infer<typeof CampaignFilterSchema>;
export type CreateCampaign = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaign = z.infer<typeof UpdateCampaignSchema>;
