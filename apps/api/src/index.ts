import { Hono } from 'hono';

const app = new Hono();

// Health check
app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// TODO: Add auth, campaign, wallet, pledge, and donation routes

// Export for Cloudflare Workers
export default app;
