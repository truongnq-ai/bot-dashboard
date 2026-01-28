/**
 * Next.js Middleware
 * 
 * Protects routes and checks authentication.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAMES } from './lib/config/cookie.config';
import { decodeJWT, isTokenExpired } from './lib/utils/jwt';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/content', '/users', '/system', '/profile'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get refresh token from cookie
  const refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

  // Handle protected routes
  if (isProtectedRoute) {
    if (!accessToken && !refreshToken) {
      // No tokens at all, redirect to login
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // If access token is missing or expired, but refresh token exists
    // Let it pass so the client-side can handle silent refresh
    if ((!accessToken || isTokenExpired(accessToken)) && refreshToken) {
      return NextResponse.next();
    }

    // Check if access token is expired and no refresh token
    if (accessToken && isTokenExpired(accessToken) && !refreshToken) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Handle auth routes (redirect to dashboard if already authenticated)
  if (isAuthRoute && accessToken && !isTokenExpired(accessToken)) {
    // Get redirect parameter from URL
    const redirectPath = request.nextUrl.searchParams.get('redirect');
    const targetPath = redirectPath && redirectPath.startsWith('/')
      ? decodeURIComponent(redirectPath)
      : '/dashboard';
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
