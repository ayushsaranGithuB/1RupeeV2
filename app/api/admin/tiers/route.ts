import { NextRequest, NextResponse } from 'next/server';
import { tierService } from '@/server/services/admin';
import { CreateTierSchema } from '@/server/schemas/admin';
import { errorResponse, successResponse, validationError } from '@/server/utils/response';
import { requireAdmin } from '@/server/lib/session';

export const runtime = 'nodejs';

// POST /api/admin/tiers - create a support tier
export async function POST(request: NextRequest) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const body = await request.json();
        const data = CreateTierSchema.parse(body);
        const tier = await tierService.createTier(data);
        return NextResponse.json(successResponse(tier), { status: 201 });
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error creating tier:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to create tier'), { status: 500 });
    }
}
