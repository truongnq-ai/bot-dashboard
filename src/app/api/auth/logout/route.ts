/**
 * Logout API Route — Bot Dashboard (Next.js proxy)
 *
 * VPS prod /auth/logout: POST không nhận body — chỉ xóa cookies phía frontend.
 * Khi backend deploy version mới (có refresh_token endpoint) sẽ tự động revoke qua cookie.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/lib/config/api.config';
import { COOKIE_NAMES } from '@/lib/config/cookie.config';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Gọi backend logout (VPS prod không nhận body refreshToken)
    const apiUrl = getApiBaseUrl();
    await fetch(`${apiUrl}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => { /* ignore backend error — vẫn xóa cookie */ });

    // Xóa cookies
    cookieStore.delete(COOKIE_NAMES.ACCESS_TOKEN);
    cookieStore.delete(COOKIE_NAMES.REFRESH_TOKEN);

    return NextResponse.json({ errorCode: '0000', errorDetail: 'Đăng xuất thành công', data: null });
  } catch (error) {
    console.error('Logout error:', error);
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAMES.ACCESS_TOKEN);
    cookieStore.delete(COOKIE_NAMES.REFRESH_TOKEN);
    return NextResponse.json({ errorCode: '0000', errorDetail: 'Đăng xuất thành công', data: null });
  }
}
