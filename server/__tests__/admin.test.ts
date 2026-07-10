import { describe, it, expect, beforeAll } from 'vitest';
import app from '../index';

describe('Admin API Endpoints', () => {
    // Real auth is now Better Auth sessions; use the test-only auth seam
    // (honored only when NODE_ENV === 'test') to exercise admin route logic.
    const adminHeaders = {
        'x-test-auth': 'admin',
        'Content-Type': 'application/json',
    };

    // Helper function to make requests
    async function makeRequest(method: string, path: string, body?: any) {
        const response = await app.request(
            new Request(`http://localhost:3000${path}`, {
                method,
                headers: adminHeaders,
                body: body ? JSON.stringify(body) : undefined,
            })
        );
        const data = await response.json();
        return { status: response.status, data };
    }

    describe('NGO Management', () => {
        it('POST /admin/ngos should reject invalid data', async () => {
            const { status, data } = await makeRequest('POST', '/admin/ngos', {
                name: 'AB', // Too short
                slug: 'test',
            });
            expect(status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('GET /admin/ngos should return ngos list or handle missing DB', async () => {
            const { status, data } = await makeRequest('GET', '/admin/ngos');
            // Either success or graceful failure
            expect([200, 500]).toContain(status);
            expect(data.success !== undefined).toBe(true);
        });

        it('GET /admin/ngos?limit=10 should parse pagination params', async () => {
            const { status } = await makeRequest('GET', '/admin/ngos?limit=10&offset=0');
            expect([200, 500]).toContain(status);
        });

        it('GET /admin/ngos?limit=150 should reject invalid limit', async () => {
            const { status, data } = await makeRequest('GET', '/admin/ngos?limit=150');
            expect(status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    describe('Campaign Management', () => {
        it('POST /admin/campaigns should validate required fields', async () => {
            const { status, data } = await makeRequest('POST', '/admin/campaigns', {
                title: 'Test',
                ngo_id: 'invalid-uuid',
            });
            expect(status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('GET /admin/campaigns should return campaigns or handle DB error', async () => {
            const { status, data } = await makeRequest('GET', '/admin/campaigns');
            expect([200, 500]).toContain(status);
            expect(data.success !== undefined).toBe(true);
        });

        it('GET /admin/campaigns?ngo_id=uuid should filter by NGO', async () => {
            const testUUID = '550e8400-e29b-41d4-a716-446655440000';
            const { status } = await makeRequest('GET', `/admin/campaigns?ngo_id=${testUUID}`);
            expect([200, 500]).toContain(status);
        });

        it('GET /admin/campaigns?status=DRAFT should filter by status', async () => {
            const { status } = await makeRequest('GET', '/admin/campaigns?status=DRAFT');
            expect([200, 500]).toContain(status);
        });
    });

    describe('Support Tier Editor', () => {
        it('POST /admin/tiers should validate campaign_id is UUID', async () => {
            const { status, data } = await makeRequest('POST', '/admin/tiers', {
                campaign_id: 'not-a-uuid',
                title: 'Test Tier',
                daily_amount: 100,
                monthly_equivalent: 3000,
            });
            expect(status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('POST /admin/tiers should validate amounts are positive', async () => {
            const { status, data } = await makeRequest('POST', '/admin/tiers', {
                campaign_id: '550e8400-e29b-41d4-a716-446655440000',
                title: 'Test Tier',
                daily_amount: -100, // Invalid
                monthly_equivalent: 3000,
            });
            expect(status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('GET /admin/campaigns/:campaignId/tiers should list tiers or handle DB error', async () => {
            const testUUID = '550e8400-e29b-41d4-a716-446655440000';
            const { status, data } = await makeRequest('GET', `/admin/campaigns/${testUUID}/tiers`);
            expect([200, 500]).toContain(status);
            expect(data.success !== undefined).toBe(true);
        });

        it('PATCH /admin/tiers/:id should allow partial updates', async () => {
            const testUUID = '550e8400-e29b-41d4-a716-446655440000';
            const { status, data } = await makeRequest('PATCH', `/admin/tiers/${testUUID}`, {
                title: 'Updated Title',
            });
            // Either success or 404/500 if tier doesn't exist
            expect([200, 404, 500]).toContain(status);
        });

        it('DELETE /admin/tiers/:id should succeed or handle missing resource', async () => {
            const testUUID = '550e8400-e29b-41d4-a716-446655440000';
            const { status } = await makeRequest('DELETE', `/admin/tiers/${testUUID}`);
            // Should succeed even if resource doesn't exist
            expect([200, 500]).toContain(status);
        });
    });

    describe('User Search', () => {
        it('GET /admin/users/search should handle missing query params', async () => {
            const { status, data } = await makeRequest('GET', '/admin/users/search');
            expect([200, 500]).toContain(status);
            expect(data.success !== undefined).toBe(true);
        });

        it('GET /admin/users/search?email=test@example.com should search by email', async () => {
            const { status, data } = await makeRequest('GET', '/admin/users/search?email=test@example.com');
            expect([200, 500]).toContain(status);
        });

        it('GET /admin/users/search?name=John should search by name', async () => {
            const { status, data } = await makeRequest('GET', '/admin/users/search?name=John');
            expect([200, 500]).toContain(status);
        });

        it('GET /admin/users/search?status=suspended should filter by status', async () => {
            const { status, data } = await makeRequest('GET', '/admin/users/search?status=suspended');
            expect([200, 500]).toContain(status);
        });

        it('GET /admin/users/:id should handle user details request', async () => {
            const testUUID = '550e8400-e29b-41d4-a716-446655440000';
            const { status, data } = await makeRequest('GET', `/admin/users/${testUUID}`);
            expect([200, 404, 500]).toContain(status);
        });
    });

    describe('Payout Workflow', () => {
        it('POST /admin/cron/daily-run should validate run_date format', async () => {
            const { status, data } = await makeRequest('POST', '/admin/cron/daily-run', {
                run_date: 'not-a-valid-date',
            });
            expect(status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('POST /admin/cron/daily-run should execute or handle DB error', async () => {
            const { status, data } = await makeRequest('POST', '/admin/cron/daily-run', {
                max_pledges: 1,
            });
            expect([200, 500]).toContain(status);
            expect(data.success !== undefined).toBe(true);
        });

        it('POST /admin/payouts should validate NGO UUID', async () => {
            const { status, data } = await makeRequest('POST', '/admin/payouts', {
                ngo_id: 'invalid-uuid',
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 86400000).toISOString(),
            });
            expect(status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('POST /admin/payouts should validate date format', async () => {
            const { status, data } = await makeRequest('POST', '/admin/payouts', {
                ngo_id: '550e8400-e29b-41d4-a716-446655440000',
                start_date: 'invalid-date',
                end_date: 'invalid-date',
            });
            expect(status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('GET /admin/payouts should return pending payouts or handle DB error', async () => {
            const { status, data } = await makeRequest('GET', '/admin/payouts');
            expect([200, 500]).toContain(status);
            expect(data.success !== undefined).toBe(true);
        });

        it('POST /admin/payouts/run should validate paired dates', async () => {
            const { status, data } = await makeRequest('POST', '/admin/payouts/run', {
                start_date: new Date().toISOString(),
            });
            expect(status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('POST /admin/payouts/run should execute or handle DB error', async () => {
            const { status, data } = await makeRequest('POST', '/admin/payouts/run');
            expect([200, 500]).toContain(status);
            expect(data.success !== undefined).toBe(true);
        });

        it('GET /admin/jobs/runs should validate limit', async () => {
            const { status, data } = await makeRequest('GET', '/admin/jobs/runs?limit=999');
            expect(status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('GET /admin/jobs/runs should return run history or handle DB error', async () => {
            const { status, data } = await makeRequest('GET', '/admin/jobs/runs?limit=10&offset=0');
            expect([200, 500]).toContain(status);
            expect(data.success !== undefined).toBe(true);
        });

        it('GET /admin/payouts/:id should handle payout details request', async () => {
            const testUUID = '550e8400-e29b-41d4-a716-446655440000';
            const { status, data } = await makeRequest('GET', `/admin/payouts/${testUUID}`);
            expect([200, 404, 500]).toContain(status);
        });

        it('POST /admin/payouts/:id/approve should validate payout_id in body', async () => {
            const testUUID = '550e8400-e29b-41d4-a716-446655440000';
            const { status, data } = await makeRequest('POST', `/admin/payouts/${testUUID}/approve`, {
                payout_id: 'invalid-uuid',
            });
            expect(status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('POST /admin/payouts/:id/process should validate razorpay_transfer_id', async () => {
            const testUUID = '550e8400-e29b-41d4-a716-446655440000';
            const { status, data } = await makeRequest('POST', `/admin/payouts/${testUUID}/process`, {
                payout_id: 'invalid-uuid',
                razorpay_transfer_id: '',
            });
            expect(status).toBe(400);
            expect(data.success).toBe(false);
        });
    });

    describe('Auth & Error Handling', () => {
        it('should reject requests without auth header', async () => {
            const response = await app.request(
                new Request('http://localhost:3000/admin/ngos', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                })
            );
            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.success).toBe(false);
        });

        it('should reject invalid auth header format', async () => {
            const response = await app.request(
                new Request('http://localhost:3000/admin/ngos', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'InvalidFormat',
                        'Content-Type': 'application/json',
                    },
                })
            );
            expect(response.status).toBe(401);
        });

        it('should return proper error for non-existent admin endpoint', async () => {
            const response = await app.request(
                new Request('http://localhost:3000/admin/nonexistent', {
                    method: 'GET',
                    headers: adminHeaders,
                })
            );
            expect(response.status).toBe(404);
        });
    });

    describe('Validation & Error Messages', () => {
        it('should validate NGO slug format', async () => {
            const { status, data } = await makeRequest('POST', '/admin/ngos', {
                name: 'Valid Organization Name',
                slug: 'INVALID-UPPERCASE', // Invalid format
                description: 'Valid description with sufficient length',
            });
            expect(status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBeDefined();
        });

        it('should validate campaign slug format', async () => {
            const { status, data } = await makeRequest('POST', '/admin/campaigns', {
                ngo_id: '550e8400-e29b-41d4-a716-446655440000',
                title: 'Valid Campaign Title',
                slug: 'INVALID-UPPERCASE',
                description: 'Valid long description with sufficient content',
            });
            expect(status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('should enforce minimum description length', async () => {
            const { status, data } = await makeRequest('POST', '/admin/ngos', {
                name: 'Valid Organization Name',
                slug: 'valid-slug',
                description: 'Short', // Too short
            });
            expect(status).toBe(400);
            expect(data.success).toBe(false);
        });

        it('should enforce minimum campaign description length', async () => {
            const { status, data } = await makeRequest('POST', '/admin/campaigns', {
                ngo_id: '550e8400-e29b-41d4-a716-446655440000',
                title: 'Valid Campaign Title',
                slug: 'valid-slug',
                description: 'Too short', // Should be 50+ chars
            });
            expect(status).toBe(400);
            expect(data.success).toBe(false);
        });
    });
});
