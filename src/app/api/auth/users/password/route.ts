/**
 * Change Password Proxy API Route
 * 
 * Proxies the change password request to the backend service.
 * Injects the access token from the HttpOnly cookie.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getApiBaseUrl } from '@/lib/config/api.config';
import { COOKIE_NAMES } from '@/lib/config/cookie.config';
import { ResponseObject } from '@/types/common';

export async function PUT(request: NextRequest) {
    try {
        // Get access token from HttpOnly cookie
        const cookieStore = await cookies();
        const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

        if (!accessToken) {
            return NextResponse.json(
                {
                    errorCode: '4001',
                    errorDetail: 'Authentication required',
                    data: null,
                } as ResponseObject<null>,
                { status: 401 }
            );
        }

        const body = await request.json();

        // Call Core Service change password endpoint
        const apiUrl = getApiBaseUrl();
        const response = await fetch(`${apiUrl}/api/v1/auth/users/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(error, { status: response.status });
        }

        const backendResponse = await response.json();

        return NextResponse.json(backendResponse);
    } catch (error) {
        console.error('Change password proxy error:', error);
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
