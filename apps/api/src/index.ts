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

const app = new Hono<{ Variables: { auth?: AuthContext } }>();

// Middleware
app.use(logger());
app.use(cors());
app.use(prettyJSON());

// Health check endpoint
app.get('/health', (c) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// Public routes
app.route('/campaigns', campaignsRouter);
app.route('/stats', statsRouter);

// Protected routes (require authentication)
app.use('/wallets/*', async (c, next) => {
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
    // Admin auth middleware
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
