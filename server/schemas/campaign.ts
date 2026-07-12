import { z } from 'zod';

export const CampaignCategorySchema = z.enum([
    'EDUCATION',
    'HEALTHCARE',
    'ANIMAL_WELFARE',
    'ENVIRONMENT',
    'HUNGER',
    'WATER_SANITATION',
]);

export const CampaignFilterSchema = z.object({
    ngo_id: z.string().uuid().optional(),
    category: CampaignCategorySchema.optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

export const CreateCampaignSchema = z.object({
    ngo_id: z.string().uuid(),
    title: z.string().min(5).max(255),
    slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/),
    category: CampaignCategorySchema.optional(),
    description: z.string().min(20),
    mobile_hero_image: z.string().url().optional(),
    desktop_hero_image: z.string().url().optional(),
    logo_url: z.string().url().optional(),
    impact_highlights: z.array(z.string()).optional(),
    goal_amount: z.number().int().positive(),
    status: z.enum(['DRAFT', 'ACTIVE']).default('DRAFT'),
});

export const UpdateCampaignSchema = z.object({
    title: z.string().min(5).max(255).optional(),
    category: CampaignCategorySchema.optional(),
    description: z.string().min(20).optional(),
    mobile_hero_image: z.string().url().optional(),
    desktop_hero_image: z.string().url().optional(),
    logo_url: z.string().url().optional(),
    impact_highlights: z.array(z.string()).optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional(),
});

export type CampaignFilter = z.infer<typeof CampaignFilterSchema>;
export type CreateCampaign = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaign = z.infer<typeof UpdateCampaignSchema>;
