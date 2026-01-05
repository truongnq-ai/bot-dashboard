/**
 * Check Authentication API Route
 * 
 * Server-side API route to check if user is authenticated.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/lib/config/cookie.config';
import { decodeJWT, isTokenExpired } from '@/lib/utils/jwt';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return NextResponse.json({ isAuthenticated: false });
    }

    // Check if token is expired
    if (isTokenExpired(accessToken)) {
      return NextResponse.json({ isAuthenticated: false });
    }

    // Decode token to get user info
    const payload = decodeJWT(accessToken);
    
    return NextResponse.json({
      isAuthenticated: true,
      user: payload ? { sub: payload.sub } : null,
    });
  } catch (error) {
    console.error('Check auth error:', error);
    return NextResponse.json({ isAuthenticated: false });
  }
}
