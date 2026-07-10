import { z } from 'zod';

export const CreatePledgeSchema = z.object({
    campaign_tier_id: z.string().uuid('Invalid campaign tier ID'),
    plan_length_months: z.number().int().min(1).max(12, 'Plan length must be 1-12 months'),
    reference_id: z.string().uuid('Invalid reference ID').optional(),
});

export const UpdatePledgeStatusSchema = z.object({
    status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED']),
});

export type CreatePledge = z.infer<typeof CreatePledgeSchema>;
export type UpdatePledgeStatus = z.infer<typeof UpdatePledgeStatusSchema>;
