/**
 * Authentication Service
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  AuthenticationRequest,
  AuthenticationResponse,
  AuthenticationResponseData,
  RefreshTokenResponseData,
} from '../../types/auth';
import { ResponseObject } from '../../types/common';

/**
 * Login as admin
 */
export async function login(
  username: string,
  password: string
): Promise<ResponseObject<AuthenticationResponse>> {
  const request: AuthenticationRequest = { username, password };
  
  // Call API route instead of directly calling backend
  // API route will set httpOnly cookies
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  
  return response.json();
}

/**
 * Refresh access token
 */
export async function refreshToken(): Promise<ResponseObject<AuthenticationResponse>> {
  // Call API route instead of directly calling backend
  // API route will read refreshToken from cookie and update cookies
  const response = await fetch('/api/auth/refresh', {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  
  return response.json();
}

/**
 * Logout
 */
export async function logout(): Promise<ResponseObject<void>> {
  // Call API route instead of directly calling backend
  // API route will revoke refreshToken and clear cookies
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  
  return response.json();
}
