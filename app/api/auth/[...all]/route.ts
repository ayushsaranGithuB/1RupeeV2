import { NextRequest } from 'next/server';
import { auth } from '@/server/lib/auth';

export const runtime = 'nodejs';

// Better Auth handler (magic link, phone OTP, sessions, admin/impersonation).
// auth.basePath is '/api/auth', matching this route's path.
function handler(request: NextRequest) {
    return auth.handler(request);
}

export const GET = handler;
export const POST = handler;
