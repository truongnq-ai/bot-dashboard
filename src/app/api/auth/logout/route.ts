/**
 * Logout API Route — Bot Dashboard (Next.js proxy)
 * Revoke refreshToken trên backend, xóa cả 2 cookies.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/lib/config/api.config';
import { COOKIE_NAMES } from '@/lib/config/cookie.config';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

    if (refreshToken) {
      // Gọi backend để revoke refresh token
      const apiUrl = getApiBaseUrl();
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => { /* ignore backend error — vẫn xóa cookie */ });
    }

    // Xóa cookies
    cookieStore.delete(COOKIE_NAMES.ACCESS_TOKEN);
    cookieStore.delete(COOKIE_NAMES.REFRESH_TOKEN);

    return NextResponse.json({ errorCode: '0000', errorDetail: 'Đăng xuất thành công', data: null });
  } catch (error) {
    console.error('Logout error:', error);
    // Vẫn xóa cookie kể cả khi lỗi
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAMES.ACCESS_TOKEN);
    cookieStore.delete(COOKIE_NAMES.REFRESH_TOKEN);
    return NextResponse.json({ errorCode: '0000', errorDetail: 'Đăng xuất thành công', data: null });
  }
}
