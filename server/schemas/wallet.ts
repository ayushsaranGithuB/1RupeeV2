import { z } from 'zod';

export const WalletTopupSchema = z.object({
    amount: z.number().int().positive().min(100), // Min 100 paise (₹1)
    reference_id: z.string().uuid().optional(),
});

export type WalletTopup = z.infer<typeof WalletTopupSchema>;
