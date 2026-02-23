/**
 * Next.js Middleware — Bot Dashboard
 * Bảo vệ routes và kiểm tra authentication.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAMES } from './lib/config/cookie.config';
import { decodeJWT, isTokenExpired } from './lib/utils/jwt';

// Routes yêu cầu xác thực
const protectedRoutes = [
  '/dashboard',
  '/users',
  '/accounts',
  '/balances',
  '/signals',
  '/orders',
  '/positions',
  '/risk-alerts',
  '/system-health',
  '/config',
];

// Routes chỉ cho user chưa đăng nhập
const authRoutes = ['/login', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

  // Xử lý protected routes
  if (isProtectedRoute) {
    if (!accessToken && !refreshToken) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Nếu access token hết hạn nhưng còn refresh token → cho qua (client sẽ silent refresh)
    if ((!accessToken || isTokenExpired(accessToken)) && refreshToken) {
      return NextResponse.next();
    }

    // Access token hết hạn, không có refresh token → login
    if (accessToken && isTokenExpired(accessToken) && !refreshToken) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Redirect về dashboard nếu đã login rồi vào auth routes
  if (isAuthRoute && accessToken && !isTokenExpired(accessToken)) {
    const redirectPath = request.nextUrl.searchParams.get('redirect');
    const targetPath =
      redirectPath && redirectPath.startsWith('/') ? decodeURIComponent(redirectPath) : '/dashboard';
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
