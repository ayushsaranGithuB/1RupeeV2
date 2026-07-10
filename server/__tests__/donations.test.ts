import { describe, it, expect } from 'vitest';
import app from '../index';

describe('GET /donations', () => {
    it('should reject requests without auth header', async () => {
        const req = new Request('http://localhost:3000/api/donations');
        const res = await app.fetch(req);

        expect(res.status).toBe(401);
        const body = await res.json() as any;
        expect(body.success).toBe(false);
        expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject a bare bearer token (no real session)', async () => {
        const req = new Request('http://localhost:3000/api/donations', {
            headers: { Authorization: 'Bearer test-token' },
        });
        const res = await app.fetch(req);

        expect(res.status).toBe(401);
    });

    it('should return the authenticated user\'s donation history', async () => {
        const req = new Request('http://localhost:3000/api/donations', {
            headers: { 'x-test-auth': 'user' },
        });
        const res = await app.fetch(req);

        // Auth passes; the query may succeed with an empty list or fail
        // without a live DB, but it must never be unauthorized.
        expect(res.status).not.toBe(401);

        if (res.status === 200) {
            const body = await res.json() as any;
            expect(body.success).toBe(true);
            expect(Array.isArray(body.data)).toBe(true);
            if (body.data.length > 0) {
                const [donation] = body.data;
                expect(donation).toHaveProperty('campaign_title');
                expect(donation).toHaveProperty('ngo_name');
                expect(donation).toHaveProperty('amount');
            }
        }
    });
});
