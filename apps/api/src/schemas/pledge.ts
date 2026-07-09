import { z } from 'zod';

export const CreatePledgeSchema = z.object({
    campaign_tier_id: z.string().uuid(),
});

export const UpdatePledgeStatusSchema = z.object({
    status: z.enum(['ACTIVE', 'PAUSED', 'CANCELLED']),
});

export type CreatePledge = z.infer<typeof CreatePledgeSchema>;
export type UpdatePledgeStatus = z.infer<typeof UpdatePledgeStatusSchema>;
