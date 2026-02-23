/**
 * Login API Route — Bot Dashboard (Next.js proxy)
 *
 * Layer trung gian: nhận credentials → gọi bot-core-service → set httpOnly cookies.
 * Bot-core-service response format: { responseCode, responseMessage, responseData }
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/lib/config/api.config';
import { COOKIE_NAMES } from '@/lib/config/cookie.config';

const ACCESS_TOKEN_MAX_AGE = 8 * 60 * 60;    // 8 giờ (giây)
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 ngày (giây)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { errorCode: '4003', errorDetail: 'Username và password là bắt buộc', data: null },
        { status: 400 }
      );
    }

    // Gọi bot-core-service
    const apiUrl = getApiBaseUrl();
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const backendResponse = await response.json();

    // bot-core-service trả responseCode: '0000' khi thành công (từ constants.py ResponseCode.SUCCESS = "0000")
    if (backendResponse.responseCode !== '0000' || !backendResponse.responseData) {
      return NextResponse.json(
        {
          errorCode: '4001',
          errorDetail: backendResponse.responseMessage || 'Đăng nhập thất bại',
          data: null,
        },
        { status: 401 }
      );
    }

    const authData = backendResponse.responseData;
    const { accessToken, refreshToken } = authData;

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { errorCode: '5001', errorDetail: 'Backend không trả về token', data: null },
        { status: 500 }
      );
    }

    // Set httpOnly cookies
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: '/',
    });

    cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: '/',
    });

    // Trả về format frontend expect: errorCode '0000' = success
    return NextResponse.json({
      errorCode: '0000',
      errorDetail: 'Đăng nhập thành công',
      data: {
        accessToken,
        user: authData.user,
      },
    });
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      { errorCode: '5001', errorDetail: 'Lỗi server nội bộ', data: null },
      { status: 500 }
    );
  }
}
