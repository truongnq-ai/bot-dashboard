/**
 * Next.js Middleware
 * 
 * Protects routes and checks authentication.
 * Also enforces Phase 1 scope - blocks routes outside Phase 1 allowed scope.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJWT, isTokenExpired } from './lib/utils/jwt';
import { isPhase1AllowedRoute } from './lib/config/phase1-routes.config';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/content', '/users', '/ai-quality', '/system', '/profile'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get access token from cookie
  const accessToken = request.cookies.get('accessToken')?.value;

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

    // Phase 1 scope check: After authentication passes, check if route is in Phase 1 allowed scope
    if (!isPhase1AllowedRoute(pathname)) {
      // Route is protected but not in Phase 1 scope - redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Handle auth routes (redirect to dashboard if already authenticated)
  if (isAuthRoute && accessToken && !isTokenExpired(accessToken)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
