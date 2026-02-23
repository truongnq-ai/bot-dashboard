/**
 * Catch-all API Proxy Route
 *
 * Browser → /api/proxy/strategy/status
 * This route → fetch http://171.244.10.135/api/v1/strategy/status (server-side)
 * Response → trả nguyên về browser (KHÔNG redirect, KHÔNG CORS)
 *
 * Giải quyết:
 *  - Mixed Content (browser chỉ thấy HTTPS hoặc same-origin)
 *  - CORS (server-to-server, không cần headers)
 *  - Backend redirect (server follow redirect, browser không thấy)
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = 'http://171.244.10.135/api/v1';

async function proxyRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = path.join('/');
  const url = new URL(request.url);
  const queryString = url.search; // ?status=OPEN&limit=200

  const backendUrl = `${BACKEND_BASE}/${targetPath}${queryString}`;

  // Forward headers (giữ Authorization, Content-Type)
  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('content-type') || 'application/json',
  };
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  try {
    // Build fetch options
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      redirect: 'follow', // Server tự follow redirect — browser không biết
    };

    // Forward body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const body = await request.text();
        if (body) {
          fetchOptions.body = body;
        }
      } catch {
        // no body
      }
    }

    const backendResponse = await fetch(backendUrl, fetchOptions);

    // Đọc response body
    const responseBody = await backendResponse.text();

    // Trả về nguyên response (status + body) — KHÔNG redirect
    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: {
        'Content-Type': backendResponse.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error(`[Proxy Error] ${request.method} ${backendUrl}:`, error);
    return NextResponse.json(
      { error: 'Backend không phản hồi', detail: String(error) },
      { status: 502 }
    );
  }
}

// Export all HTTP methods
export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
