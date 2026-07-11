import { NextRequest, NextResponse } from 'next/server';
import { ngoService } from '@/server/services/admin';
import { CreateNgoSchema, NgoFilterSchema } from '@/server/schemas/admin';
import { errorResponse, successResponse, validationError } from '@/server/utils/response';
import { requireAdmin } from '@/server/lib/session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const body = await request.json();
        const data = CreateNgoSchema.parse(body);
        const ngo = await ngoService.createNgo(data);
        return NextResponse.json(successResponse(ngo), { status: 201 });
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error creating NGO:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to create NGO'), { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const query = Object.fromEntries(new URL(request.url).searchParams);
        const filters = NgoFilterSchema.parse(query);
        const ngos = await ngoService.listNgos(filters.status, filters.search, filters.limit, filters.offset);
        return NextResponse.json(successResponse(ngos));
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error listing NGOs:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to list NGOs'), { status: 500 });
    }
}
