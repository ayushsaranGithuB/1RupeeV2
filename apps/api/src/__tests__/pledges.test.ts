import { describe, it, expect } from 'bun:test';
import app from '../index';

describe('GET /pledges', () => {
    it('should reject requests without auth header', async () => {
        const req = new Request('http://localhost:3000/pledges');
        const res = await app.fetch(req);

        expect(res.status).toBe(401);
    });

    it('should return the joined campaign/tier fields alongside each pledge', async () => {
        const req = new Request('http://localhost:3000/pledges', {
            headers: { 'x-test-auth': 'user' },
        });
        const res = await app.fetch(req);

        expect(res.status).not.toBe(401);

        if (res.status === 200) {
            const body = await res.json() as any;
            expect(body.success).toBe(true);
            expect(Array.isArray(body.data)).toBe(true);
            if (body.data.length > 0) {
                const [pledge] = body.data;
                expect(pledge).toHaveProperty('campaign_title');
                expect(pledge).toHaveProperty('tier_title');
                expect(pledge).toHaveProperty('daily_amount');
            }
        }
    });
});
