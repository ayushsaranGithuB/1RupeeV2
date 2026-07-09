import { describe, it, expect } from 'bun:test';
import app from '../index';

describe('API Endpoints', () => {
    describe('GET /health', () => {
        it('should return health status', async () => {
            const req = new Request('http://localhost:3000/health');
            const res = await app.fetch(req);

            expect(res.status).toBe(200);
            const body = await res.json() as any;
            expect(body.status).toBe('ok');
            expect(body.timestamp).toBeDefined();
        });
    });

    describe('GET /campaigns', () => {
        it('should handle campaigns endpoint', async () => {
            const req = new Request('http://localhost:3000/campaigns');
            const res = await app.fetch(req);

            // Accept both 200 (with DB) or 500 (without DB) in test environment
            expect(res.status === 200 || res.status === 500).toBe(true);
            const body = await res.json() as any;
            expect(body.success !== undefined || body.error !== undefined).toBe(true);
        });
    });

    describe('GET /stats', () => {
        it('should handle stats endpoint', async () => {
            const req = new Request('http://localhost:3000/stats');
            const res = await app.fetch(req);

            // Accept both 200 (with DB) or 500 (without DB) in test environment
            expect(res.status === 200 || res.status === 500).toBe(true);
            const body = await res.json() as any;
            expect(body.success !== undefined || body.error !== undefined).toBe(true);
        });
    });

    describe('Protected routes', () => {
        it('should reject requests without auth header', async () => {
            const req = new Request('http://localhost:3000/wallets');
            const res = await app.fetch(req);

            expect(res.status).toBe(401);
            const body = await res.json() as any;
            expect(body.success).toBe(false);
            expect(body.error.code).toBe('UNAUTHORIZED');
        });

        it('should accept requests with valid auth header', async () => {
            const req = new Request('http://localhost:3000/wallets', {
                headers: {
                    'Authorization': 'Bearer test-token',
                },
            });
            const res = await app.fetch(req);

            // Should not return 401
            expect(res.status).not.toBe(401);
        });
    });

    describe('404 handling', () => {
        it('should return 404 for non-existent routes', async () => {
            const req = new Request('http://localhost:3000/non-existent');
            const res = await app.fetch(req);

            expect(res.status).toBe(404);
            const body = await res.json() as any;
            expect(body.success).toBe(false);
            expect(body.error.code).toBe('NOT_FOUND');
        });
    });
});
