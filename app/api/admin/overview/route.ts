import { NextRequest, NextResponse } from 'next/server';
import { adminReportingService } from '@/server/services/admin';
import { errorResponse, successResponse } from '@/server/utils/response';
import { requireAdmin } from '@/server/lib/session';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const overview = await adminReportingService.getOverview();
        return NextResponse.json(successResponse(overview));
    } catch (error: any) {
        console.error('Error loading admin overview:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to load admin overview'), { status: 500 });
    }
}
