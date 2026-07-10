import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import campaignsRouter from './routes/campaigns';
import statsRouter from './routes/stats';
import walletsRouter from './routes/wallets';
import pledgesRouter from './routes/pledges';
import adminRouter from './routes/admin';
import paymentsRouter from './routes/payments';
import { AuthContext, ApiUser } from './types';
import { successResponse, errorResponse } from './utils/response';
import { checkDatabaseHealth } from '@db';
import { auth } from './lib/auth';

type SessionContext = {
    user: ApiUser;
    impersonatedBy: string | null;
};

// Test-only auth seam. ONLY active when NODE_ENV === 'test' (i.e. under
// `bun test`); it can never be triggered in development or production, so it is
// not an auth bypass in any real deployment. Lets route-logic tests run without
// a live Better Auth session. `x-test-auth`: 'admin' | 'user' | 'impersonating'.
function testSessionContext(c: any): SessionContext | null {
    if (process.env.NODE_ENV !== 'test') {
        return null;
    }
    const header = c.req.header('x-test-auth');
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
            avatar_url: null,
            role,
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
        },
        impersonatedBy: header === 'impersonating' ? TEST_ADMIN_ID : null,
    };
}

// Resolve the current Better Auth session (cookie-based, forwarded by the web
// proxy) into the app's ApiUser shape. Returns null when unauthenticated.
async function getSessionContext(c: any): Promise<SessionContext | null> {
    const testCtx = testSessionContext(c);
    if (testCtx) {
        return testCtx;
    }

    const result = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!result?.user) {
        return null;
    }

    const u = result.user as any;
    const s = result.session as any;

    const user: ApiUser = {
        id: u.id,
        email: u.email,
        name: u.name,
        avatar_url: u.image ?? null,
        role: (u.role as 'USER' | 'ADMIN') ?? 'USER',
        status: u.banned ? 'suspended' : 'active',
        created_at: u.createdAt ? new Date(u.createdAt) : new Date(),
        updated_at: u.updatedAt ? new Date(u.updatedAt) : new Date(),
    };

    return { user, impersonatedBy: s?.impersonatedBy ?? null };
}

console.log('🚀 API Server Starting with detailed logging...');

const app = new Hono<{ Variables: { auth?: AuthContext } }>();

// Middleware
// CORS must be applied FIRST to handle preflight requests
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use(logger());

// Detailed request logging for debugging
app.use(async (c, next) => {
    const method = c.req.method;
    const path = c.req.path;
    const origin = c.req.header('Origin') || 'no-origin';
    const auth = c.req.header('Authorization') ? 'present' : 'missing';

    console.log(`[${new Date().toISOString()}] 📨 Incoming Request:`);
    console.log(`  Method: ${method}`);
    console.log(`  Path: ${path}`);
    console.log(`  Origin: ${origin}`);
    console.log(`  Authorization: ${auth}`);

    const start = Date.now();
    await next();
    const duration = Date.now() - start;

    console.log(`  Status: ${c.res.status}`);
    console.log(`  Duration: ${duration}ms`);
    console.log('---');
});

app.use(prettyJSON());

// Health check endpoint
app.get('/health', async (c) => {
    console.log('👉 /health endpoint called');

    try {
        const dbHealth = await checkDatabaseHealth();
        const status = dbHealth.healthy ? 'ok' : 'degraded';

        return c.json({
            status,
            timestamp: new Date().toISOString(),
            database: dbHealth,
        }, dbHealth.healthy ? 200 : 503);
    } catch (error) {
        console.error('Health check failed:', error);

        return c.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: {
                connected: false,
                healthy: false,
                tables: [],
            },
        }, 503);
    }
});

// Debug endpoint
app.get('/debug', (c) => {
    console.log('👉 /debug endpoint called');
    return c.json({
        timestamp: new Date().toISOString(),
        message: 'Debug endpoint working'
    });
});

// Better Auth handler (magic link, phone OTP, sessions, admin/impersonation).
// Mounted at /auth/* to match auth.basePath.
app.on(['POST', 'GET'], '/auth/*', (c) => auth.handler(c.req.raw));

// Public routes
app.route('/campaigns', campaignsRouter);
app.route('/stats', statsRouter);
app.route('/payments', paymentsRouter);

// Protected routes (require an authenticated Better Auth session).
// The session cookie is carried through the web app's /api/proxy gateway.
const requireUser = async (c: any, next: any) => {
    if (c.req.method === 'OPTIONS') {
        return await next();
    }

    const ctx = await getSessionContext(c);
    if (!ctx) {
        return c.json(errorResponse('UNAUTHORIZED', 'Authentication required'), 401);
    }

    // When impersonating, ctx.user is the impersonated user — exactly what we
    // want donor endpoints to resolve to.
    c.set('auth', { user: ctx.user, role: ctx.user.role });
    await next();
};

app.use('/wallets/*', requireUser);
app.use('/pledges/*', requireUser);

app.route('/wallets', walletsRouter);
app.route('/pledges', pledgesRouter);

// Admin routes require an ADMIN session. Impersonating sessions are rejected so
// an admin viewing-as-user cannot perform admin actions while impersonating.
app.use('/admin/*', async (c, next) => {
    if (c.req.method === 'OPTIONS') {
        return await next();
    }

    const ctx = await getSessionContext(c);
    if (!ctx) {
        return c.json(errorResponse('UNAUTHORIZED', 'Authentication required'), 401);
    }
    if (ctx.impersonatedBy) {
        return c.json(
            errorResponse('FORBIDDEN', 'Admin actions are disabled while impersonating a user'),
            403
        );
    }
    if (ctx.user.role !== 'ADMIN') {
        return c.json(errorResponse('FORBIDDEN', 'Admin access required'), 403);
    }

    c.set('auth', { user: ctx.user, role: 'ADMIN' });
    await next();
});

app.route('/admin', adminRouter);

// 404 handler
app.notFound((c) => {
    return c.json(errorResponse('NOT_FOUND', 'Endpoint not found'), 404);
});

// Error handler
app.onError((err, c) => {
    console.error('Unhandled error:', err);
    return c.json(
        errorResponse('INTERNAL_ERROR', 'An unexpected error occurred'),
        500
    );
});

export default app;

// Start server
async function startServer() {
    try {
        const health = await checkDatabaseHealth();

        console.log('🔎 Startup database health check:', {
            connected: health.connected,
            healthy: health.healthy,
            tables: health.tables.map((table) => ({
                name: table.name,
                rowCount: table.rowCount,
                hasData: table.hasData,
            })),
        });

        if (!health.healthy) {
            console.warn('⚠️ API started with an unhealthy database: one or more tables are empty');
        }
    } catch (error) {
        console.error('❌ API server failed database health check:', error);
        throw error;
    }

    const port = process.env.API_PORT || 3001;
    Bun.serve({
        port,
        fetch: app.fetch,
    });
    console.log(`✅ API Server running at http://localhost:${port}`);
}

if (process.env.NODE_ENV !== 'test') {
    startServer().catch((error) => {
        console.error('❌ API server failed to start:', error);
        process.exit(1);
    });
}
