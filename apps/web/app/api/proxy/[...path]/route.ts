export async function GET(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathArray } = await params;
    const path = pathArray.join('/');

    // Extract query string from request URL
    const url = new URL(request.url);
    const queryString = url.search;

    const apiUrl = `http://127.0.0.1:3001/${path}${queryString}`;

    try {
        const headers = new Headers();
        const authHeader = request.headers.get('Authorization');
        if (authHeader) {
            headers.set('Authorization', authHeader);
        }

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers,
        });

        const data = await response.json();
        return Response.json(data, { status: response.status });
    } catch (error) {
        console.error('[Proxy Error]', error);
        return Response.json(
            { error: 'Failed to proxy request' },
            { status: 500 }
        );
    }
}
