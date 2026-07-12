import { z } from 'zod';

export const WalletTopupSchema = z.object({
    amount: z.number().int().positive().min(1), // Min ₹1
    reference_id: z.string().uuid().optional(),
});

export type WalletTopup = z.infer<typeof WalletTopupSchema>;
