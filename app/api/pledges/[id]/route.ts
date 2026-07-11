import { NextRequest, NextResponse } from 'next/server';
import { pledgeService } from '@/server/services/pledge';
import { successResponse, errorResponse, ErrorCodes } from '@/server/utils/response';
import { UpdatePledgeStatusSchema } from '@/server/schemas/pledge';
import { requireUser } from '@/server/lib/session';

export const runtime = 'nodejs';

// PATCH /api/pledges/:id - Update pledge status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireUser(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const parsed = UpdatePledgeStatusSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid request body'),
                { status: 400 }
            );
        }

        const pledge = await pledgeService.updatePledge(id, guard.auth.user.id, parsed.data);

        if (!pledge) {
            return NextResponse.json(
                errorResponse(ErrorCodes.NOT_FOUND, 'Pledge not found'),
                { status: 404 }
            );
        }

        return NextResponse.json(successResponse(pledge));
    } catch (error: any) {
        if (error.message === 'PLEDGE_NOT_FOUND') {
            return NextResponse.json(
                errorResponse(ErrorCodes.NOT_FOUND, 'Pledge not found'),
                { status: 404 }
            );
        }

        console.error('Error updating pledge:', error);
        return NextResponse.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to update pledge'),
            { status: 500 }
        );
    }
}
