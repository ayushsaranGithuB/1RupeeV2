import { z } from 'zod';

type PaymentProviderName = 'mock' | 'razorpay';

export type PaymentWebhookEvent = {
    referenceId: string;
    userId: string;
    amount: number;
    providerPaymentId: string;
};

export interface PaymentProvider {
    name: PaymentProviderName;
    verifyWebhook(headers: Record<string, string | undefined>, rawBody: string): Promise<boolean>;
    parseCapturedPayment(rawBody: string): PaymentWebhookEvent | null;
}

const MockWebhookSchema = z.object({
    event: z.literal('payment.captured'),
    data: z.object({
        reference_id: z.string().uuid(),
        user_id: z.string().uuid(),
        amount: z.number().int().positive().min(1), // Rupees
        payment_id: z.string().min(1),
    }),
});

// Razorpay's wire format is always in paise, regardless of our internal unit.
const RazorpayWebhookSchema = z.object({
    event: z.literal('payment.captured'),
    payload: z.object({
        payment: z.object({
            entity: z.object({
                id: z.string().min(1),
                amount: z.number().int().positive().min(100), // Paise
                notes: z.object({
                    reference_id: z.string().uuid(),
                    user_id: z.string().uuid(),
                }),
            }),
        }),
    }),
});

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(Math.ceil(hex.length / 2));
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
}

function normalizeProvider(value?: string): PaymentProviderName {
    if (value?.toLowerCase() === 'razorpay') {
        return 'razorpay';
    }

    return 'mock';
}

class MockPaymentProvider implements PaymentProvider {
    name: PaymentProviderName = 'mock';

    async verifyWebhook(headers: Record<string, string | undefined>, rawBody: string): Promise<boolean> {
        const signature = headers['x-mock-signature'];
        const secret = process.env.MOCK_WEBHOOK_SECRET || 'mock-webhook-secret';

        if (!signature) {
            return false;
        }

        try {
            const key = await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(secret),
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['verify']
            );

            const signatureBytes = hexToBytes(signature) as BufferSource;
            const bodyBytes = new TextEncoder().encode(rawBody);

            return await crypto.subtle.verify(
                'HMAC',
                key,
                signatureBytes,
                bodyBytes
            );
        } catch {
            return false;
        }
    }

    parseCapturedPayment(rawBody: string): PaymentWebhookEvent | null {
        let parsedJson: unknown;

        try {
            parsedJson = JSON.parse(rawBody);
        } catch {
            return null;
        }

        const parsed = MockWebhookSchema.safeParse(parsedJson);
        if (!parsed.success) {
            return null;
        }

        return {
            referenceId: parsed.data.data.reference_id,
            userId: parsed.data.data.user_id,
            amount: parsed.data.data.amount,
            providerPaymentId: parsed.data.data.payment_id,
        };
    }
}

class RazorpayPaymentProvider implements PaymentProvider {
    name: PaymentProviderName = 'razorpay';

    async verifyWebhook(headers: Record<string, string | undefined>, rawBody: string): Promise<boolean> {
        const signature = headers['x-razorpay-signature'];
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!signature || !secret) {
            return false;
        }

        try {
            const key = await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(secret),
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['verify']
            );

            const signatureBytes = hexToBytes(signature) as BufferSource;
            const bodyBytes = new TextEncoder().encode(rawBody);

            return await crypto.subtle.verify(
                'HMAC',
                key,
                signatureBytes,
                bodyBytes
            );
        } catch {
            return false;
        }
    }

    parseCapturedPayment(rawBody: string): PaymentWebhookEvent | null {
        let parsedJson: unknown;

        try {
            parsedJson = JSON.parse(rawBody);
        } catch {
            return null;
        }

        const parsed = RazorpayWebhookSchema.safeParse(parsedJson);
        if (!parsed.success) {
            return null;
        }

        return {
            referenceId: parsed.data.payload.payment.entity.notes.reference_id,
            userId: parsed.data.payload.payment.entity.notes.user_id,
            amount: parsed.data.payload.payment.entity.amount / 100, // Paise -> rupees
            providerPaymentId: parsed.data.payload.payment.entity.id,
        };
    }
}

export function getPaymentProvider(): PaymentProvider {
    const provider = normalizeProvider(process.env.PAYMENT_PROVIDER);

    if (provider === 'razorpay') {
        return new RazorpayPaymentProvider();
    }

    return new MockPaymentProvider();
}
