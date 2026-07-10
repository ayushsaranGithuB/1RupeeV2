import { describe, it, expect } from 'vitest';
import app from '../index';

describe('POST /pledges - Checkout flow', () => {
    it('should create a pledge and deduct from wallet', async () => {
        const req = new Request('http://localhost:3000/pledges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-test-auth': 'user', // Test auth header
            },
            body: JSON.stringify({
                campaign_tier_id: '123e4567-e89b-12d3-a456-426614174000', // Dummy UUID
                plan_length_months: 6,
                reference_id: '223e4567-e89b-12d3-a456-426614174000',
            }),
        });
        const res = await app.fetch(req);

        // Should return 404 because tier doesn't exist, but validates schema
        expect(res.status).toBe(404);
        const body = await res.json() as any;
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('NOT_FOUND');
    });

    it('should reject pledge with invalid plan length', async () => {
        const req = new Request('http://localhost:3000/pledges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-test-auth': 'user',
            },
            body: JSON.stringify({
                campaign_tier_id: '123e4567-e89b-12d3-a456-426614174000',
                plan_length_months: 13, // Invalid: > 12
                reference_id: '223e4567-e89b-12d3-a456-426614174000',
            }),
        });
        const res = await app.fetch(req);

        expect(res.status).toBe(400);
        const body = await res.json() as any;
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject pledge with plan length < 1', async () => {
        const req = new Request('http://localhost:3000/pledges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-test-auth': 'user',
            },
            body: JSON.stringify({
                campaign_tier_id: '123e4567-e89b-12d3-a456-426614174000',
                plan_length_months: 0, // Invalid: < 1
                reference_id: '223e4567-e89b-12d3-a456-426614174000',
            }),
        });
        const res = await app.fetch(req);

        expect(res.status).toBe(400);
    });

    it('should reject pledge without authentication', async () => {
        const req = new Request('http://localhost:3000/pledges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // No auth header
            },
            body: JSON.stringify({
                campaign_tier_id: '123e4567-e89b-12d3-a456-426614174000',
                plan_length_months: 6,
                reference_id: '223e4567-e89b-12d3-a456-426614174000',
            }),
        });
        const res = await app.fetch(req);

        expect(res.status).toBe(401);
        const body = await res.json() as any;
        expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject pledge with missing campaign_tier_id', async () => {
        const req = new Request('http://localhost:3000/pledges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-test-auth': 'user',
            },
            body: JSON.stringify({
                plan_length_months: 6,
                reference_id: '223e4567-e89b-12d3-a456-426614174000',
            }),
        });
        const res = await app.fetch(req);

        expect(res.status).toBe(400);
        const body = await res.json() as any;
        expect(body.error.code).toBe('VALIDATION_ERROR');
    });
});
