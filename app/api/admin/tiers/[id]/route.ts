import { NextRequest, NextResponse } from 'next/server';
import { tierService } from '@/server/services/admin';
import { UpdateTierSchema } from '@/server/schemas/admin';
import { errorResponse, successResponse, validationError } from '@/server/utils/response';
import { requireAdmin } from '@/server/lib/session';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const { id } = await params;
        const tier = await tierService.getTier(id);
        if (!tier) {
            return NextResponse.json(errorResponse('NOT_FOUND', 'Tier not found'), { status: 404 });
        }
        return NextResponse.json(successResponse(tier));
    } catch (error: any) {
        console.error('Error fetching tier:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to fetch tier'), { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const data = UpdateTierSchema.parse(body);
        const tier = await tierService.updateTier(id, data);
        if (!tier) {
            return NextResponse.json(errorResponse('NOT_FOUND', 'Tier not found'), { status: 404 });
        }
        return NextResponse.json(successResponse(tier));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error updating tier:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to update tier'), { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const { id } = await params;
        await tierService.deleteTier(id);
        return NextResponse.json(successResponse({ success: true }));
    } catch (error: any) {
        console.error('Error deleting tier:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to delete tier'), { status: 500 });
    }
}
