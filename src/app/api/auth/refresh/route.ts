/**
 * Refresh Token API Route
 * 
 * Server-side API route to refresh access token and update cookies.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/lib/config/api.config';
import { ResponseObject } from '@/types/common';
import { AuthenticationResponse } from '@/types/auth';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          errorCode: '1006',
          errorDetail: 'Refresh token not found',
          data: null,
        } as ResponseObject<null>,
        { status: 401 }
      );
    }

    // Call Core Service refresh token endpoint
    const apiUrl = getApiBaseUrl();
    const response = await fetch(`${apiUrl}/v1/auth/refresh_token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const refreshResponse = await response.json();
    const authResponse: AuthenticationResponse = refreshResponse.data;

    // Update cookies with new tokens
    cookieStore.set('accessToken', authResponse.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: authResponse.expiresIn, // seconds
      path: '/',
    });

    cookieStore.set('refreshToken', authResponse.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: authResponse.refreshTokenExpiresIn, // seconds
      path: '/',
    });

    // Return success response
    return NextResponse.json({
      errorCode: '0000',
      errorDetail: 'Token refreshed successfully',
      data: authResponse,
    } as ResponseObject<AuthenticationResponse>);
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      {
        errorCode: '5001',
        errorDetail: 'Internal server error',
        data: null,
      } as ResponseObject<null>,
      { status: 500 }
    );
  }
}
