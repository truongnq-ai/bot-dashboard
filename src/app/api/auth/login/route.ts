/**
 * Login API Route
 * 
 * Server-side API route to handle login and set httpOnly cookies.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/lib/config/api.config';
import { ResponseObject } from '@/types/common';
import { AuthenticationResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        {
          errorCode: '4003',
          errorDetail: 'Username and password are required',
          data: null,
        } as ResponseObject<null>,
        { status: 400 }
      );
    }

    // Call Core Service login endpoint
    const apiUrl = getApiBaseUrl();
    const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const backendResponse: ResponseObject<AuthenticationResponse> = await response.json();
    
    if (backendResponse.errorCode !== '0000' || !backendResponse.data) {
      return NextResponse.json(
        {
          errorCode: backendResponse.errorCode || '5001',
          errorDetail: backendResponse.errorDetail || 'Login failed',
          data: null,
        } as ResponseObject<null>,
        { status: 400 }
      );
    }

    const authResponse: AuthenticationResponse = backendResponse.data;

    // Set httpOnly cookies
    const cookieStore = await cookies();
    
    // Set accessToken cookie
    cookieStore.set('accessToken', authResponse.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: authResponse.expiresIn, // seconds
      path: '/',
    });

    // Set refreshToken cookie
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
      errorDetail: 'Login successful',
      data: authResponse,
    } as ResponseObject<AuthenticationResponse>);
  } catch (error) {
    console.error('Login error:', error);
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
