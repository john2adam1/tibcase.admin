import { NextResponse } from 'next/server';

const getBackendUrl = () => {
  return (process.env.BACKEND_API_URL || 'https://api.tibsphereai.uz').replace(/\/$/, '');
};

async function handleProxy(req, context) {
  const { params } = context;
  const pathParams = await params;
  const pathArray = pathParams?.path || [];
  const targetPath = pathArray.join('/');

  const backendBase = getBackendUrl();
  const searchParams = req.nextUrl.search;
  const targetUrl = `${backendBase}/${targetPath}${searchParams}`;

  // Forward authorization & language headers securely
  const headers = new Headers();
  const authHeader = req.headers.get('authorization');
  if (authHeader) headers.set('authorization', authHeader);

  const langHeader = req.headers.get('accept-language') || 'uz';
  headers.set('accept-language', langHeader);

  const contentType = req.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  let body = null;
  if (!['GET', 'HEAD'].includes(req.method)) {
    try {
      body = await req.text();
    } catch {
      body = null;
    }
  }

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: 'no-store'
    });

    const responseText = await res.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }

    return NextResponse.json(data, {
      status: res.status,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    });
  } catch (error) {
    // Graceful error handling - avoid leaking backend host or stack trace to client
    return NextResponse.json(
      {
        error: "Backend server bilan aloqa o'rnatilmadi. Iltimos, server holatini tekshiring."
      },
      {
        status: 503,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY'
        }
      }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
