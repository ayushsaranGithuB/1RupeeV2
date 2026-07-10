async function proxyRequest(
    request: Request,
    params: Promise<{ path: string[] }>,
    method: string
) {
    const { path: pathArray } = await params;
    const path = pathArray.join('/');
    const url = new URL(request.url);
    const queryString = url.search;
    const apiBase = (process.env.API_URL ?? 'http://127.0.0.1:3001').replace(/\/$/, '');
    const apiUrl = `${apiBase}/${path}${queryString}`;

    try {
        const headers = new Headers();
        const authHeader = request.headers.get('Authorization');
        const contentType = request.headers.get('Content-Type');
        // Forward the session cookie and origin so Better Auth (mounted on the
        // API at /auth/*) can read the session and pass its origin/CSRF checks.
        const cookie = request.headers.get('cookie');
        const origin = request.headers.get('origin');

        if (authHeader) {
            headers.set('Authorization', authHeader);
        }

        if (contentType) {
            headers.set('Content-Type', contentType);
        }

        if (cookie) {
            headers.set('cookie', cookie);
        }

        if (origin) {
            headers.set('origin', origin);
        }

        const init: RequestInit = {
            method,
            headers,
        };

        if (!['GET', 'DELETE'].includes(method)) {
            init.body = await request.text();
        }

        const response = await fetch(apiUrl, init);
        const responseText = await response.text();
        const responseType = response.headers.get('content-type') || 'application/json';

        const responseHeaders = new Headers({ 'Content-Type': responseType });

        // Relay auth cookies back to the browser (there may be several).
        const setCookies =
            typeof (response.headers as any).getSetCookie === 'function'
                ? (response.headers as any).getSetCookie()
                : response.headers.get('set-cookie')
                    ? [response.headers.get('set-cookie') as string]
                    : [];
        for (const value of setCookies) {
            responseHeaders.append('set-cookie', value);
        }

        return new Response(responseText, {
            status: response.status,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error('[Proxy Error]', error);
        return Response.json(
            { error: 'Failed to proxy request' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return proxyRequest(request, params, 'GET');
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return proxyRequest(request, params, 'POST');
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return proxyRequest(request, params, 'PATCH');
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    return proxyRequest(request, params, 'DELETE');
}