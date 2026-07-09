import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const apiUrl = process.env.API_URL || 'http://localhost:3001';
        const authHeader = request.headers.get('Authorization');

        const response = await fetch(`${apiUrl}/admin/ngos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader && { Authorization: authHeader }),
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error fetching NGOs:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch NGOs' },
            { status: 500 }
        );
    }
}
