import { createHmac, timingSafeEqual } from 'crypto';
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
    verifyWebhook(headers: Record<string, string | undefined>, rawBody: string): boolean;
    parseCapturedPayment(rawBody: string): PaymentWebhookEvent | null;
}

const MockWebhookSchema = z.object({
    event: z.literal('payment.captured'),
    data: z.object({
        reference_id: z.string().uuid(),
        user_id: z.string().uuid(),
        amount: z.number().int().positive().min(100),
        payment_id: z.string().min(1),
    }),
});

const RazorpayWebhookSchema = z.object({
    event: z.literal('payment.captured'),
    payload: z.object({
        payment: z.object({
            entity: z.object({
                id: z.string().min(1),
                amount: z.number().int().positive().min(100),
                notes: z.object({
                    reference_id: z.string().uuid(),
                    user_id: z.string().uuid(),
                }),
            }),
        }),
    }),
});

function safeEqualHex(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left, 'hex');
    const rightBuffer = Buffer.from(right, 'hex');

    if (leftBuffer.length !== rightBuffer.length) {
        return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
}

function normalizeProvider(value?: string): PaymentProviderName {
    if (value?.toLowerCase() === 'razorpay') {
        return 'razorpay';
    }

    return 'mock';
}

class MockPaymentProvider implements PaymentProvider {
    name: PaymentProviderName = 'mock';

    verifyWebhook(headers: Record<string, string | undefined>, rawBody: string): boolean {
        const signature = headers['x-mock-signature'];
        const secret = process.env.MOCK_WEBHOOK_SECRET || 'mock-webhook-secret';

        if (!signature) {
            return false;
        }

        const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
        return safeEqualHex(signature, expected);
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

    verifyWebhook(headers: Record<string, string | undefined>, rawBody: string): boolean {
        const signature = headers['x-razorpay-signature'];
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!signature || !secret) {
            return false;
        }

        const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
        return safeEqualHex(signature, expected);
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
            amount: parsed.data.payload.payment.entity.amount,
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
