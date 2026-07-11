import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '../utils/response';

// Test-only dispatcher that mirrors Next.js's own file-based routing so the
// existing route-level integration tests (written against the old Hono
// `app.fetch`) don't need a full rewrite. It matches a request's path/method
// against the same route table as `app/api/**/route.ts` and invokes the real
// handler — never shipped, exists purely so these tests exercise the actual
// handler + auth-guard code.
type RouteModule = Record<string, (request: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>>;

type RouteDef = {
    method: string;
    path: string;
    load: () => Promise<RouteModule>;
};

const routes: RouteDef[] = [
    { method: 'GET', path: '/health', load: () => import('@/app/api/health/route') },
    { method: 'GET', path: '/campaigns', load: () => import('@/app/api/campaigns/route') },
    { method: 'GET', path: '/campaigns/:slug', load: () => import('@/app/api/campaigns/[slug]/route') },
    { method: 'GET', path: '/stats', load: () => import('@/app/api/stats/route') },
    { method: 'GET', path: '/stats/reports', load: () => import('@/app/api/stats/reports/route') },
    { method: 'POST', path: '/register', load: () => import('@/app/api/register/route') },
    { method: 'GET', path: '/wallets', load: () => import('@/app/api/wallets/route') },
    { method: 'GET', path: '/wallets/transactions', load: () => import('@/app/api/wallets/transactions/route') },
    { method: 'POST', path: '/wallets/topup', load: () => import('@/app/api/wallets/topup/route') },
    { method: 'GET', path: '/pledges', load: () => import('@/app/api/pledges/route') },
    { method: 'POST', path: '/pledges', load: () => import('@/app/api/pledges/route') },
    { method: 'PATCH', path: '/pledges/:id', load: () => import('@/app/api/pledges/[id]/route') },
    { method: 'GET', path: '/donations', load: () => import('@/app/api/donations/route') },
    { method: 'POST', path: '/payments/webhook', load: () => import('@/app/api/payments/webhook/route') },
    { method: 'POST', path: '/internal/cron/daily-run', load: () => import('@/app/api/internal/cron/daily-run/route') },
    { method: 'GET', path: '/admin/overview', load: () => import('@/app/api/admin/overview/route') },
    { method: 'POST', path: '/admin/ngos', load: () => import('@/app/api/admin/ngos/route') },
    { method: 'GET', path: '/admin/ngos', load: () => import('@/app/api/admin/ngos/route') },
    { method: 'GET', path: '/admin/ngos/:id', load: () => import('@/app/api/admin/ngos/[id]/route') },
    { method: 'PATCH', path: '/admin/ngos/:id', load: () => import('@/app/api/admin/ngos/[id]/route') },
    { method: 'POST', path: '/admin/ngos/:id/verify', load: () => import('@/app/api/admin/ngos/[id]/verify/route') },
    { method: 'POST', path: '/admin/campaigns', load: () => import('@/app/api/admin/campaigns/route') },
    { method: 'GET', path: '/admin/campaigns', load: () => import('@/app/api/admin/campaigns/route') },
    { method: 'GET', path: '/admin/campaigns/:id', load: () => import('@/app/api/admin/campaigns/[id]/route') },
    { method: 'PATCH', path: '/admin/campaigns/:id', load: () => import('@/app/api/admin/campaigns/[id]/route') },
    { method: 'GET', path: '/admin/campaigns/:id/tiers', load: () => import('@/app/api/admin/campaigns/[id]/tiers/route') },
    { method: 'GET', path: '/admin/campaigns/:id/supporters', load: () => import('@/app/api/admin/campaigns/[id]/supporters/route') },
    { method: 'POST', path: '/admin/tiers', load: () => import('@/app/api/admin/tiers/route') },
    { method: 'GET', path: '/admin/tiers/:id', load: () => import('@/app/api/admin/tiers/[id]/route') },
    { method: 'PATCH', path: '/admin/tiers/:id', load: () => import('@/app/api/admin/tiers/[id]/route') },
    { method: 'DELETE', path: '/admin/tiers/:id', load: () => import('@/app/api/admin/tiers/[id]/route') },
    { method: 'GET', path: '/admin/users/search', load: () => import('@/app/api/admin/users/search/route') },
    { method: 'GET', path: '/admin/users/:id', load: () => import('@/app/api/admin/users/[id]/route') },
    { method: 'GET', path: '/admin/users/:id/profile', load: () => import('@/app/api/admin/users/[id]/profile/route') },
    { method: 'POST', path: '/admin/users/:id/wallet-adjustments', load: () => import('@/app/api/admin/users/[id]/wallet-adjustments/route') },
    { method: 'POST', path: '/admin/users/:id/suspend', load: () => import('@/app/api/admin/users/[id]/suspend/route') },
    { method: 'GET', path: '/admin/donations', load: () => import('@/app/api/admin/donations/route') },
    { method: 'GET', path: '/admin/ledger', load: () => import('@/app/api/admin/ledger/route') },
    { method: 'GET', path: '/admin/reports', load: () => import('@/app/api/admin/reports/route') },
    { method: 'POST', path: '/admin/reports', load: () => import('@/app/api/admin/reports/route') },
    { method: 'POST', path: '/admin/cron/daily-run', load: () => import('@/app/api/admin/cron/daily-run/route') },
    { method: 'POST', path: '/admin/payouts', load: () => import('@/app/api/admin/payouts/route') },
    { method: 'GET', path: '/admin/payouts', load: () => import('@/app/api/admin/payouts/route') },
    { method: 'POST', path: '/admin/payouts/run', load: () => import('@/app/api/admin/payouts/run/route') },
    { method: 'GET', path: '/admin/jobs/runs', load: () => import('@/app/api/admin/jobs/runs/route') },
    { method: 'GET', path: '/admin/payouts/:id', load: () => import('@/app/api/admin/payouts/[id]/route') },
    { method: 'POST', path: '/admin/payouts/:id/approve', load: () => import('@/app/api/admin/payouts/[id]/approve/route') },
    { method: 'POST', path: '/admin/payouts/:id/process', load: () => import('@/app/api/admin/payouts/[id]/process/route') },
];

function matchRoute(method: string, requestSegments: string[]): { route: RouteDef; params: Record<string, string> } | null {
    let best: { route: RouteDef; params: Record<string, string>; score: number } | null = null;

    for (const route of routes) {
        if (route.method !== method) continue;

        const routeSegments = route.path.split('/').filter(Boolean);
        if (routeSegments.length !== requestSegments.length) continue;

        let score = 0;
        let ok = true;
        const params: Record<string, string> = {};

        for (let i = 0; i < routeSegments.length; i++) {
            const rs = routeSegments[i];
            const qs = requestSegments[i];
            if (rs.startsWith(':')) {
                params[rs.slice(1)] = qs;
            } else if (rs === qs) {
                score++;
            } else {
                ok = false;
                break;
            }
        }

        if (ok && (!best || score > best.score)) {
            best = { route, params, score };
        }
    }

    return best;
}

export async function callApi(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, '') || '/';

    // Better Auth owns everything under /auth/* directly.
    if (path.startsWith('/auth/')) {
        const mod = await import('@/app/api/auth/[...all]/route');
        const handler = mod[request.method as 'GET' | 'POST'];
        if (handler) {
            return handler(request as unknown as NextRequest);
        }
    }

    const requestSegments = path.split('/').filter(Boolean);
    const match = matchRoute(request.method, requestSegments);

    if (!match) {
        return NextResponse.json(errorResponse('NOT_FOUND', 'Endpoint not found'), { status: 404 });
    }

    const mod = await match.route.load();
    const handler = mod[request.method];
    if (!handler) {
        return NextResponse.json(errorResponse('NOT_FOUND', 'Endpoint not found'), { status: 404 });
    }

    return handler(request as unknown as NextRequest, { params: Promise.resolve(match.params) });
}
