/**
 * Logout API Route
 * 
 * Server-side API route to logout and clear cookies.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/lib/config/api.config';
import { ResponseObject } from '@/types/common';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (refreshToken) {
      // Call Core Service logout endpoint to revoke refresh token
      const apiUrl = getApiBaseUrl();
      await fetch(`${apiUrl}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json',
        },
      });
    }

    // Clear cookies
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    // Return success response
    return NextResponse.json({
      errorCode: '0000',
      errorDetail: 'Logged out successfully',
      data: null,
    } as ResponseObject<null>);
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, clear cookies
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    return NextResponse.json(
      {
        errorCode: '0000',
        errorDetail: 'Logged out successfully',
        data: null,
      } as ResponseObject<null>
    );
  }
}
