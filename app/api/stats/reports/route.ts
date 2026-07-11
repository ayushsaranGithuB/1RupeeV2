import { NextResponse } from 'next/server';
import { successResponse, errorResponse, ErrorCodes } from '@/server/utils/response';
import { getDb } from '@db';
import { transparency_reports } from '@db/schema';
import { desc } from 'drizzle-orm';

export const runtime = 'nodejs';

// GET /api/stats/reports - Get latest transparency reports
export async function GET() {
    try {
        const db = getDb();
        const reports = await db
            .select()
            .from(transparency_reports)
            .orderBy(desc(transparency_reports.created_at))
            .limit(10);

        return NextResponse.json(successResponse(reports), {
            headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600' },
        });
    } catch (error) {
        console.error('Error fetching transparency reports:', error);
        return NextResponse.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch transparency reports'),
            { status: 500 }
        );
    }
}
