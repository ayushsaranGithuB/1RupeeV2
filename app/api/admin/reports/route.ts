import { NextRequest, NextResponse } from 'next/server';
import { adminReportingService } from '@/server/services/admin';
import { TransparencyReportSchema } from '@/server/schemas/admin';
import { errorResponse, successResponse, validationError } from '@/server/utils/response';
import { requireAdmin } from '@/server/lib/session';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const reports = await adminReportingService.listReports();
        return NextResponse.json(successResponse(reports));
    } catch (error: any) {
        console.error('Error loading reports:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to load reports'), { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const guard = await requireAdmin(request);
    if (guard instanceof NextResponse) {
        return guard;
    }

    try {
        const body = await request.json();
        const data = TransparencyReportSchema.parse(body);
        const report = await adminReportingService.createReport(data);
        return NextResponse.json(successResponse(report), { status: 201 });
    } catch (error: any) {
        const validation = validationError(error);
        if (validation) {
            return NextResponse.json(validation, { status: 400 });
        }
        console.error('Error creating report:', error.message);
        return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to create report'), { status: 500 });
    }
}
