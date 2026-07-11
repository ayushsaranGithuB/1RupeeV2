import { NextRequest, NextResponse } from 'next/server';
import { ngoService } from '@/server/services/admin';
import { errorResponse, successResponse } from '@/server/utils/response';
import { requireAdmin } from '@/server/lib/session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const ngo = await ngoService.verifyNgo(id, body?.verification_notes);
        if (!ngo) {
            return NextResponse.json(errorResponse('NOT_FOUND', 'NGO not found'), { status: 404 });
        }
        return NextResponse.json(successResponse(ngo));
    } catch (error: any) {
        console.error('Error verifying NGO:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to verify NGO'), { status: 500 });
    }
}
