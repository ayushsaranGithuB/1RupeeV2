import { Hono } from 'hono';
import { walletService } from '../services/wallet';
import { getPaymentProvider } from '../services/payment';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';

const payments = new Hono();

// POST /payments/webhook - Process payment provider webhook
payments.post('/webhook', async (c) => {
    try {
        const provider = getPaymentProvider();
        const rawBody = await c.req.text();
        const headers = {
            'x-mock-signature': c.req.header('x-mock-signature'),
            'x-razorpay-signature': c.req.header('x-razorpay-signature'),
        };

        if (!(await provider.verifyWebhook(headers, rawBody))) {
            return c.json(
                errorResponse(ErrorCodes.UNAUTHORIZED, 'Invalid webhook signature'),
                401
            );
        }

        const paymentEvent = provider.parseCapturedPayment(rawBody);
        if (!paymentEvent) {
            return c.json(
                errorResponse(ErrorCodes.VALIDATION_ERROR, 'Unsupported or invalid webhook payload'),
                400
            );
        }

        await walletService.topupFromWebhook(
            paymentEvent.userId,
            {
                amount: paymentEvent.amount,
                reference_id: paymentEvent.referenceId,
            },
            `${provider.name}:${paymentEvent.providerPaymentId}`
        );

        return c.json(successResponse({
            processed: true,
            provider: provider.name,
            reference_id: paymentEvent.referenceId,
        }));
    } catch (error: any) {
        if (error.message === 'WALLET_NOT_FOUND') {
            return c.json(
                errorResponse(ErrorCodes.NOT_FOUND, 'Wallet not found for webhook user'),
                404
            );
        }

        console.error('Error processing payment webhook:', error);
        return c.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to process payment webhook'),
            500
        );
    }
});

export default payments;
