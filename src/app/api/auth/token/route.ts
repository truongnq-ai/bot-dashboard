/**
 * Get Access Token API Route
 * 
 * Server-side API route to get access token from httpOnly cookie.
 * This is used by the API client to get the token for Authorization header.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { token: null },
        { status: 401 }
      );
    }

    return NextResponse.json({ token: accessToken });
  } catch (error) {
    console.error('Get token error:', error);
    return NextResponse.json(
      { token: null },
      { status: 500 }
    );
  }
}
