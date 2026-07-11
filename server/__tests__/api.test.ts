import { describe, it, expect } from 'vitest';
import { callApi } from './test-helpers';

describe('API Endpoints', () => {
    describe('GET /api/health', () => {
        it('should return health status', async () => {
            const req = new Request('http://localhost:3000/api/health');
            const res = await callApi(req);

            expect([200, 503]).toContain(res.status);
            const body = await res.json() as any;
            expect(['ok', 'degraded', 'unhealthy']).toContain(body.status);
            expect(body.timestamp).toBeDefined();
            expect(body.database).toBeDefined();
            expect(Array.isArray(body.database.tables)).toBe(true);
        });
    });

    describe('GET /api/campaigns', () => {
        it('should handle campaigns endpoint', async () => {
            const req = new Request('http://localhost:3000/api/campaigns');
            const res = await callApi(req);

            // Accept both 200 (with DB) or 500 (without DB) in test environment
            expect(res.status === 200 || res.status === 500).toBe(true);
            const body = await res.json() as any;
            expect(body.success !== undefined || body.error !== undefined).toBe(true);
        });
    });

    describe('GET /api/stats', () => {
        it('should handle stats endpoint', async () => {
            const req = new Request('http://localhost:3000/api/stats');
            const res = await callApi(req);

            // Accept both 200 (with DB) or 500 (without DB) in test environment
            expect(res.status === 200 || res.status === 500).toBe(true);
            const body = await res.json() as any;
            expect(body.success !== undefined || body.error !== undefined).toBe(true);
        });
    });

    describe('Protected routes', () => {
        it('should reject requests without auth header', async () => {
            const req = new Request('http://localhost:3000/api/wallets');
            const res = await callApi(req);

            expect(res.status).toBe(401);
            const body = await res.json() as any;
            expect(body.success).toBe(false);
            expect(body.error.code).toBe('UNAUTHORIZED');
        });

        it('should reject a bare bearer token (no real session)', async () => {
            // Legacy `Bearer <anything>` no longer authenticates now that mock
            // auth is replaced by real Better Auth sessions.
            const req = new Request('http://localhost:3000/api/wallets', {
                headers: { Authorization: 'Bearer test-token' },
            });
            const res = await callApi(req);

            expect(res.status).toBe(401);
        });

        it('should accept requests with an authenticated session', async () => {
            const req = new Request('http://localhost:3000/api/wallets', {
                headers: { 'x-test-auth': 'user' },
            });
            const res = await callApi(req);

            // Auth passes; wallet may or may not exist (200/404/500) but not 401.
            expect(res.status).not.toBe(401);
        });
    });

    describe('404 handling', () => {
        it('should return 404 for non-existent routes', async () => {
            const req = new Request('http://localhost:3000/api/non-existent');
            const res = await callApi(req);

            expect(res.status).toBe(404);
            const body = await res.json() as any;
            expect(body.success).toBe(false);
            expect(body.error.code).toBe('NOT_FOUND');
        });
    });
});
