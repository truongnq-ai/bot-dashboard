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

  // Get access token from cookie
  const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

  // Handle protected routes
  if (isProtectedRoute) {
    if (!accessToken) {
      // No token, redirect to login
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Check if token is expired
    if (isTokenExpired(accessToken)) {
      // Token expired, try to refresh (this will be handled by API client)
      // For now, redirect to login
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
