/**
 * Check Authentication API Route
 *
 * Server-side API route to check if user is authenticated.
 * Nếu access token expired nhưng còn refresh token → tự silent refresh.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/lib/config/cookie.config';
import { decodeJWT, isTokenExpired } from '@/lib/utils/jwt';
import { getApiBaseUrl } from '@/lib/config/api.config';

const ACCESS_TOKEN_MAX_AGE = 8 * 60 * 60;       // 8 giờ
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 ngày

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

    // Case 1: Access token còn hạn → return authenticated
    if (accessToken && !isTokenExpired(accessToken)) {
      const payload = decodeJWT(accessToken);
      return NextResponse.json({
        isAuthenticated: true,
        user: payload ? { sub: payload.sub } : null,
      });
    }

    // Case 2: Access token expired hoặc không có → thử silent refresh
    const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;
    if (!refreshToken) {
      return NextResponse.json({ isAuthenticated: false });
    }

    // Gọi BE để refresh token
    const apiUrl = getApiBaseUrl();
    const refreshResponse = await fetch(`${apiUrl}/auth/refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshResponse.ok) {
      // Refresh thất bại → xóa cookies và logout
      cookieStore.delete(COOKIE_NAMES.ACCESS_TOKEN);
      cookieStore.delete(COOKIE_NAMES.REFRESH_TOKEN);
      return NextResponse.json({ isAuthenticated: false });
    }

    const data = await refreshResponse.json();

    if (data.responseCode !== '0000' || !data.responseData) {
      cookieStore.delete(COOKIE_NAMES.ACCESS_TOKEN);
      cookieStore.delete(COOKIE_NAMES.REFRESH_TOKEN);
      return NextResponse.json({ isAuthenticated: false });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.responseData;

    // Lưu tokens mới vào cookie
    cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: '/',
    });

    if (newRefreshToken) {
      cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: REFRESH_TOKEN_MAX_AGE,
        path: '/',
      });
    }

    // Return authenticated với token mới
    const payload = decodeJWT(newAccessToken);
    return NextResponse.json({
      isAuthenticated: true,
      user: payload ? { sub: payload.sub } : null,
    });

  } catch (error) {
    console.error('Check auth error:', error);
    return NextResponse.json({ isAuthenticated: false });
  }
}
