import { NextRequest, NextResponse } from 'next/server';
import { walletService } from '@/server/services/wallet';
import { getPaymentProvider } from '@/server/services/payment';
import { successResponse, errorResponse, ErrorCodes } from '@/server/utils/response';

export const runtime = 'nodejs';

// POST /api/payments/webhook - Process payment provider webhook
export async function POST(request: NextRequest) {
    try {
        const provider = getPaymentProvider();
        const rawBody = await request.text();
        const headers = {
            'x-mock-signature': request.headers.get('x-mock-signature') ?? undefined,
            'x-razorpay-signature': request.headers.get('x-razorpay-signature') ?? undefined,
        };

        if (!(await provider.verifyWebhook(headers, rawBody))) {
            return NextResponse.json(
                errorResponse(ErrorCodes.UNAUTHORIZED, 'Invalid webhook signature'),
                { status: 401 }
            );
        }

        const paymentEvent = provider.parseCapturedPayment(rawBody);
        if (!paymentEvent) {
            return NextResponse.json(
                errorResponse(ErrorCodes.VALIDATION_ERROR, 'Unsupported or invalid webhook payload'),
                { status: 400 }
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

        return NextResponse.json(successResponse({
            processed: true,
            provider: provider.name,
            reference_id: paymentEvent.referenceId,
        }));
    } catch (error: any) {
        if (error.message === 'WALLET_NOT_FOUND') {
            return NextResponse.json(
                errorResponse(ErrorCodes.NOT_FOUND, 'Wallet not found for webhook user'),
                { status: 404 }
            );
        }

        console.error('Error processing payment webhook:', error);
        return NextResponse.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to process payment webhook'),
            { status: 500 }
        );
    }
}
