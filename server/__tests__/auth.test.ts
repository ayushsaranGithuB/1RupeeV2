import { describe, it, expect } from 'vitest';
import app from '../index';

// These tests cover the auth/authorization wiring added with Better Auth:
// the session middleware on protected routes and the admin/impersonation gate.
// They use the test-only `x-test-auth` seam (active only under NODE_ENV=test).
function req(path: string, headers?: Record<string, string>) {
    return app.fetch(new Request(`http://localhost:3000/api${path}`, { headers }));
}

describe('Auth middleware', () => {
    describe('unauthenticated access', () => {
        for (const path of ['/wallets', '/pledges', '/admin/overview']) {
            it(`rejects ${path} without a session (401)`, async () => {
                const res = await req(path);
                expect(res.status).toBe(401);
                const body = (await res.json()) as any;
                expect(body.success).toBe(false);
                expect(body.error.code).toBe('UNAUTHORIZED');
            });
        }
    });

    describe('admin authorization', () => {
        it('allows an ADMIN session into /admin/*', async () => {
            const res = await req('/admin/overview', { 'x-test-auth': 'admin' });
            // Auth/role pass; underlying handler may 200 or 500 depending on DB.
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        it('forbids a non-admin USER session from /admin/* (403)', async () => {
            const res = await req('/admin/overview', { 'x-test-auth': 'user' });
            expect(res.status).toBe(403);
            const body = (await res.json()) as any;
            expect(body.error.code).toBe('FORBIDDEN');
        });

        it('forbids an impersonating session from /admin/* (403)', async () => {
            const res = await req('/admin/overview', {
                'x-test-auth': 'impersonating',
            });
            expect(res.status).toBe(403);
            const body = (await res.json()) as any;
            expect(body.error.code).toBe('FORBIDDEN');
        });
    });

    describe('donor routes with a session', () => {
        it('lets an authenticated user past auth on /wallets', async () => {
            const res = await req('/wallets', { 'x-test-auth': 'user' });
            expect(res.status).not.toBe(401);
        });

        it('lets an impersonating session reach donor routes', async () => {
            // While impersonating, the effective user is the impersonated user,
            // so donor endpoints must remain reachable.
            const res = await req('/pledges', { 'x-test-auth': 'impersonating' });
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });
    });

    describe('Better Auth handler is mounted', () => {
        it('serves /api/auth/get-session (returns 200, not the app 404)', async () => {
            const res = await app.fetch(
                new Request('http://localhost:3000/api/auth/get-session', {
                    method: 'GET',
                })
            );
            // Better Auth owns this namespace and returns 200 (null session)
            // rather than falling through to the app's 404 handler.
            expect(res.status).toBe(200);
        });
    });
});
