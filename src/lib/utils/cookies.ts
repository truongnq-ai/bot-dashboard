/**
 * Cookie Utilities
 * 
 * Note: httpOnly cookies can only be set from server-side (API routes or middleware).
 * Client-side cookie utilities are for non-httpOnly cookies only.
 */

import { COOKIE_NAMES } from '../config/cookie.config';

/**
 * Set a cookie (client-side only, for non-httpOnly cookies)
 */
export function setCookie(name: string, value: string, options?: {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}): void {
  if (typeof document === 'undefined') {
    return; // Server-side, cannot set cookies
  }

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options?.maxAge) {
    cookieString += `; Max-Age=${options.maxAge}`;
  }

  if (options?.expires) {
    cookieString += `; Expires=${options.expires.toUTCString()}`;
  }

  if (options?.path) {
    cookieString += `; Path=${options.path}`;
  } else {
    cookieString += '; Path=/';
  }

  if (options?.domain) {
    cookieString += `; Domain=${options.domain}`;
  }

  if (options?.secure) {
    cookieString += '; Secure';
  }

  if (options?.sameSite) {
    cookieString += `; SameSite=${options.sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * Get a cookie value (client-side only, httpOnly cookies cannot be read)
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null; // Server-side, cannot read cookies directly
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string, options?: {
  path?: string;
  domain?: string;
}): void {
  if (typeof document === 'undefined') {
    return; // Server-side, cannot delete cookies
  }

  setCookie(name, '', {
    ...options,
    maxAge: 0,
    expires: new Date(0),
  });
}

/**
 * Clear authentication cookies
 * Note: This only works for non-httpOnly cookies.
 * httpOnly cookies must be cleared from server-side (API routes).
 */
export function clearAuthCookies(): void {
  deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
  deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
}
