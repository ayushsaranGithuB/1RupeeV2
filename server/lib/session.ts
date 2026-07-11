import { NextResponse } from 'next/server';
import { auth } from './auth';
import { AuthContext, ApiUser } from '../types';
import { errorResponse } from '../utils/response';

export type SessionContext = {
    user: ApiUser;
    impersonatedBy: string | null;
};

// Test-only auth seam. ONLY active when NODE_ENV === 'test' (i.e. under
// `vitest`); it can never be triggered in development or production, so it is
// not an auth bypass in any real deployment. Lets route-logic tests run without
// a live Better Auth session. `x-test-auth`: 'admin' | 'user' | 'impersonating'.
function testSessionContext(request: Request): SessionContext | null {
    if (process.env.NODE_ENV !== 'test') {
        return null;
    }
    const header = request.headers.get('x-test-auth');
    if (!header) {
        return null;
    }
    const role: 'USER' | 'ADMIN' = header === 'admin' ? 'ADMIN' : 'USER';
    // Syntactically valid (but non-existent) UUIDs so downstream uuid columns
    // don't error; endpoints resolve to "not found" rather than a cast failure.
    const TEST_ADMIN_ID = '00000000-0000-4000-8000-0000000000ad';
    const TEST_USER_ID = '00000000-0000-4000-8000-0000000000e5';
    return {
        user: {
            id: role === 'ADMIN' ? TEST_ADMIN_ID : TEST_USER_ID,
            email: `${role.toLowerCase()}@test.local`,
            name: `Test ${role}`,
            role,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
        },
        impersonatedBy: header === 'impersonating' ? TEST_ADMIN_ID : null,
    };
}

// Resolve the current Better Auth session (first-party cookie) into the app's
// ApiUser shape. Returns null when unauthenticated.
export async function getSessionContext(request: Request): Promise<SessionContext | null> {
    const testCtx = testSessionContext(request);
    if (testCtx) {
        return testCtx;
    }

    const result = await auth.api.getSession({ headers: request.headers });
    if (!result?.user) {
        return null;
    }

    const u = result.user as any;
    const s = result.session as any;

    const user: ApiUser = {
        id: u.id,
        email: u.email,
        name: u.name,
        role: (u.role as 'USER' | 'ADMIN') ?? 'USER',
        status: u.banned ? 'suspended' : 'active',
        created_at: u.createdAt ? new Date(u.createdAt) : new Date(),
        updated_at: u.updatedAt ? new Date(u.updatedAt) : new Date(),
    };

    return { user, impersonatedBy: s?.impersonatedBy ?? null };
}

// Guard for any-authenticated-user endpoints (/wallets/*, /pledges/*, /donations/*).
// Returns the resolved auth context, or a ready-to-return 401 response.
export async function requireUser(request: Request): Promise<{ auth: AuthContext } | NextResponse> {
    const ctx = await getSessionContext(request);
    if (!ctx) {
        return NextResponse.json(errorResponse('UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    return { auth: { user: ctx.user, role: ctx.user.role } };
}

// Guard for /admin/* endpoints. Rejects unauthenticated requests (401),
// impersonating admins (403 — an admin viewing-as-user cannot perform admin
// actions while impersonating), and non-admin roles (403).
export async function requireAdmin(request: Request): Promise<{ auth: AuthContext } | NextResponse> {
    const ctx = await getSessionContext(request);
    if (!ctx) {
        return NextResponse.json(errorResponse('UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    if (ctx.impersonatedBy) {
        return NextResponse.json(
            errorResponse('FORBIDDEN', 'Admin actions are disabled while impersonating a user'),
            { status: 403 }
        );
    }
    if (ctx.user.role !== 'ADMIN') {
        return NextResponse.json(errorResponse('FORBIDDEN', 'Admin access required'), { status: 403 });
    }
    return { auth: { user: ctx.user, role: 'ADMIN' } };
}
