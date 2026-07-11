import { NextRequest, NextResponse } from 'next/server';
import { pledgeService } from '@/server/services/pledge';
import { successResponse, errorResponse, ErrorCodes } from '@/server/utils/response';
import { CreatePledgeSchema } from '@/server/schemas/pledge';
import { requireUser } from '@/server/lib/session';

export const runtime = 'nodejs';

// GET /api/pledges - List user's pledges
export async function GET(request: NextRequest) {
    const guard = await requireUser(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const status = new URL(request.url).searchParams.get('status') ?? undefined;

        const result = await pledgeService.listUserPledges(guard.auth.user.id, status);

        return NextResponse.json(successResponse(result));
    } catch (error) {
        console.error('Error listing pledges:', error);
        return NextResponse.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to list pledges'),
            { status: 500 }
        );
    }
}

// POST /api/pledges - Create a pledge with checkout (deduct from wallet, log donation)
export async function POST(request: NextRequest) {
    const guard = await requireUser(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const body = await request.json();
        const parsed = CreatePledgeSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.issues[0]?.message || 'Invalid request body'),
                { status: 400 }
            );
        }

        const result = await pledgeService.createPledge(guard.auth.user.id, parsed.data);

        return NextResponse.json(successResponse(result), { status: 201 });
    } catch (error: any) {
        if (error.message === 'PLEDGE_ALREADY_EXISTS') {
            return NextResponse.json(
                errorResponse(ErrorCodes.INVALID_STATUS, 'You already have an active pledge to this tier'),
                { status: 409 }
            );
        }

        if (error.message === 'TIER_NOT_FOUND') {
            return NextResponse.json(
                errorResponse(ErrorCodes.NOT_FOUND, 'Campaign tier not found'),
                { status: 404 }
            );
        }

        if (error.message === 'WALLET_NOT_FOUND') {
            return NextResponse.json(
                errorResponse(ErrorCodes.NOT_FOUND, 'User wallet not found'),
                { status: 404 }
            );
        }

        if (error.message?.startsWith('INSUFFICIENT_BALANCE:')) {
            const needed = error.message.split(':')[1];
            return NextResponse.json(
                errorResponse(ErrorCodes.INVALID_STATUS, `Insufficient wallet balance. You need ₹${parseInt(needed)} more.`),
                { status: 402 }
            );
        }

        console.error('Error creating pledge:', error);
        return NextResponse.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to create pledge'),
            { status: 500 }
        );
    }
}
