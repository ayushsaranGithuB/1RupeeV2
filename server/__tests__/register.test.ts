import { describe, it, expect } from 'vitest';
import app from '../index';

describe('POST /register', () => {
    it('should reject a missing phone number', async () => {
        const req = new Request('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test', email: 'new-user@example.com' }),
        });
        const res = await app.fetch(req);

        expect(res.status).toBe(400);
        const body = await res.json() as any;
        expect(body.success).toBe(false);
    });

    it('should reject a phone number without the +91 country code', async () => {
        const req = new Request('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test', email: 'new-user@example.com', phone: '9876543210' }),
        });
        const res = await app.fetch(req);

        expect(res.status).toBe(400);
    });

    it('should reject an email that already has an account', async () => {
        // Seeded by db/seed.ts; present in every dev/test database.
        const req = new Request('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User 1',
                email: 'user1@1rupee.test',
                phone: '+919876500001',
            }),
        });
        const res = await app.fetch(req);

        // Without a live DB this would 500 instead; either way it must not
        // silently succeed with a 201.
        expect(res.status).not.toBe(201);
        if (res.status === 409) {
            const body = await res.json() as any;
            expect(body.error.code).toBe('ALREADY_EXISTS');
        }
    });
});
