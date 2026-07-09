async function proxyRequest(
    request: Request,
    params: Promise<{ path: string[] }>,
    method: string
) {
    const { path: pathArray } = await params;
    const path = pathArray.join('/');
    const url = new URL(request.url);
    const queryString = url.search;
    const apiUrl = `http://127.0.0.1:3001/${path}${queryString}`;

    try {
        const headers = new Headers();
        const authHeader = request.headers.get('Authorization');
        const contentType = request.headers.get('Content-Type');

        if (authHeader) {
            headers.set('Authorization', authHeader);
        }

        if (contentType) {
            headers.set('Content-Type', contentType);
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

        return new Response(responseText, {
            status: response.status,
            headers: {
                'Content-Type': responseType,
            },
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