import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import campaignsRouter from './routes/campaigns';
import statsRouter from './routes/stats';
import walletsRouter from './routes/wallets';
import pledgesRouter from './routes/pledges';
import adminRouter from './routes/admin';
import { AuthContext } from './types';
import { successResponse, errorResponse } from './utils/response';

console.log('🚀 API Server Starting with detailed logging...');

const app = new Hono<{ Variables: { auth?: AuthContext } }>();

// Middleware
// CORS must be applied FIRST to handle preflight requests
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002'],
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
app.get('/health', (c) => {
    console.log('👉 /health endpoint called');
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// Debug endpoint
app.get('/debug', (c) => {
    console.log('👉 /debug endpoint called');
    return c.json({
        timestamp: new Date().toISOString(),
        message: 'Debug endpoint working'
    });
});

// Public routes
app.route('/campaigns', campaignsRouter);
app.route('/stats', statsRouter);

// Protected routes (require authentication)
app.use('/wallets/*', async (c, next) => {
    // Allow OPTIONS requests to pass through (CORS will handle them)
    if (c.req.method === 'OPTIONS') {
        return await next();
    }

    // Mock auth middleware - in production, use Better Auth
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return c.json(
            errorResponse('UNAUTHORIZED', 'Missing or invalid authorization header'),
            401
        );
    }

    // Mock user for testing
    c.set('auth', {
        user: {
            id: 'test-user-id',
            email: 'user@example.com',
            name: 'Test User',
            avatar_url: null,
            role: 'USER',
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
        },
        role: 'USER',
    });

    await next();
});

app.use('/pledges/*', async (c, next) => {
    // Allow OPTIONS requests to pass through (CORS will handle them)
    if (c.req.method === 'OPTIONS') {
        return await next();
    }

    // Mock auth middleware
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return c.json(
            errorResponse('UNAUTHORIZED', 'Missing or invalid authorization header'),
            401
        );
    }

    c.set('auth', {
        user: {
            id: 'test-user-id',
            email: 'user@example.com',
            name: 'Test User',
            avatar_url: null,
            role: 'USER',
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
        },
        role: 'USER',
    });

    await next();
});

app.route('/wallets', walletsRouter);
app.route('/pledges', pledgesRouter);

// Admin routes (require admin authentication)
app.use('/admin/*', async (c, next) => {
    // Allow OPTIONS requests to pass through (CORS will handle them)
    if (c.req.method === 'OPTIONS') {
        return await next();
    }

    // Admin auth middleware - only check auth for non-OPTIONS requests
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return c.json(
            errorResponse('UNAUTHORIZED', 'Missing or invalid authorization header'),
            401
        );
    }

    // Mock admin user for testing
    c.set('auth', {
        user: {
            id: 'test-admin-id',
            email: 'admin@1rupee.io',
            name: 'Admin User',
            avatar_url: null,
            role: 'ADMIN',
            status: 'active',
            created_at: new Date(),
            updated_at: new Date(),
        },
        role: 'ADMIN',
    });

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
if (process.env.NODE_ENV !== 'test') {
    const port = process.env.API_PORT || 3001;
    Bun.serve({
        port,
        fetch: app.fetch,
    });
    console.log(`✅ API Server running at http://localhost:${port}`);
}
