/**
 * Refresh Token API Route — Bot Dashboard (Next.js proxy)
 *
 * Đọc refreshToken từ httpOnly cookie → gọi bot-core-service POST /auth/refresh_token
 * → Backend dùng rotation strategy: revoke cũ, tạo cặp token mới
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/lib/config/api.config';
import { COOKIE_NAMES } from '@/lib/config/cookie.config';

const ACCESS_TOKEN_MAX_AGE = 8 * 60 * 60;       // 8 giờ
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 ngày

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { errorCode: '1006', errorDetail: 'Refresh token không tồn tại', data: null },
        { status: 401 }
      );
    }

    // Gọi bot-core-service (POST với body)
    const apiUrl = getApiBaseUrl();
    const response = await fetch(`${apiUrl}/auth/refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const backendResponse = await response.json();

    if (backendResponse.responseCode !== '0000' || !backendResponse.responseData) {
      // Xóa cookies nếu refresh thất bại
      cookieStore.delete(COOKIE_NAMES.ACCESS_TOKEN);
      cookieStore.delete(COOKIE_NAMES.REFRESH_TOKEN);
      return NextResponse.json(
        { errorCode: '1006', errorDetail: backendResponse.responseMessage || 'Token không hợp lệ', data: null },
        { status: 401 }
      );
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = backendResponse.responseData;

    // Cập nhật cookies với token mới
    cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: '/',
    });

    cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: '/',
    });

    return NextResponse.json({
      errorCode: '0000',
      errorDetail: 'Token đã được làm mới',
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    console.error('Refresh token proxy error:', error);
    return NextResponse.json(
      { errorCode: '5001', errorDetail: 'Lỗi server nội bộ', data: null },
      { status: 500 }
    );
  }
}
