import { NextRequest } from 'next/server';
import app from '@/server';

// For Cloudflare Workers with OpenNext: unspecified runtime allows the adapter
// to optimize based on environment. Node.js APIs (crypto, drizzle-orm) are
// available in Cloudflare Workers with proper configuration.
export const maxDuration = 30;

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
