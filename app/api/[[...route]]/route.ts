import { NextRequest } from 'next/server';
import app from '@/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, context: any) {
  return app.fetch(request);
}

export async function POST(request: NextRequest, context: any) {
  return app.fetch(request);
}

export async function PATCH(request: NextRequest, context: any) {
  return app.fetch(request);
}

export async function DELETE(request: NextRequest, context: any) {
  return app.fetch(request);
}

export async function PUT(request: NextRequest, context: any) {
  return app.fetch(request);
}

export async function OPTIONS(request: NextRequest, context: any) {
  return app.fetch(request);
}
