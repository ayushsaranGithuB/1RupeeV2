import { NextRequest, NextResponse } from 'next/server';
import { ngoService } from '@/server/services/admin';
import { AdminNgoUpdateSchema } from '@/server/schemas/admin';
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
        const ngo = await ngoService.getNgo(id);
        if (!ngo) {
            return NextResponse.json(errorResponse('NOT_FOUND', 'NGO not found'), { status: 404 });
        }
        return NextResponse.json(successResponse(ngo));
    } catch (error: any) {
        console.error('Error fetching NGO:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to fetch NGO'), { status: 500 });
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
        const data = AdminNgoUpdateSchema.parse(body);
        const ngo = await ngoService.updateNgo(id, data);
        if (!ngo) {
            return NextResponse.json(errorResponse('NOT_FOUND', 'NGO not found'), { status: 404 });
        }
        return NextResponse.json(successResponse(ngo));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error updating NGO:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to update NGO'), { status: 500 });
    }
}
