import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { CampaignFilterSchema, CreateCampaignSchema } from '../schemas/campaign';
import { WalletTopupSchema } from '../schemas/wallet';

describe('Schemas', () => {
    describe('CampaignFilterSchema', () => {
        it('should parse valid campaign filter', () => {
            const valid = {
                limit: 20,
                offset: 0,
            };
            const result = CampaignFilterSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        it('should reject invalid limit', () => {
            const invalid = {
                limit: 1000,
            };
            const result = CampaignFilterSchema.safeParse(invalid);
            expect(result.success).toBe(false);
        });
    });

    describe('CreateCampaignSchema', () => {
        it('should validate required fields', () => {
            const invalid = {
                title: 'Short',
            };
            const result = CreateCampaignSchema.safeParse(invalid);
            expect(result.success).toBe(false);
        });

        it('should accept valid campaign data', () => {
            const valid = {
                ngo_id: '550e8400-e29b-41d4-a716-446655440000',
                title: 'Valid Campaign Title',
                slug: 'valid-campaign',
                description: 'This is a longer description with more details about the campaign',
                goal_amount: 100000,
            };
            const result = CreateCampaignSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });
    });

    describe('WalletTopupSchema', () => {
        it('should validate topup amount', () => {
            const valid = {
                amount: 1000,
            };
            const result = WalletTopupSchema.safeParse(valid);
            expect(result.success).toBe(true);
        });

        it('should reject amount less than minimum', () => {
            const invalid = {
                amount: 50,
            };
            const result = WalletTopupSchema.safeParse(invalid);
            expect(result.success).toBe(false);
        });
    });
});
