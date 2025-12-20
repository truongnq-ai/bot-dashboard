/**
 * JWT Utilities
 * 
 * Helper functions to decode and validate JWT tokens.
 */

export interface JWTPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Decode JWT token without verification
 * Note: This does NOT verify the signature. Only use for reading claims.
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Get token expiration time (Unix timestamp in seconds)
 */
export function getTokenExpiration(token: string): number | null {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }
  return payload.exp;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiration(token);
  if (!exp) {
    return true; // If we can't read expiration, consider it expired
  }
  return Date.now() / 1000 >= exp;
}

/**
 * Check if token is expiring soon (within specified minutes)
 */
export function isTokenExpiringSoon(token: string, minutes: number = 5): boolean {
  const exp = getTokenExpiration(token);
  if (!exp) {
    return true; // If we can't read expiration, consider it expiring soon
  }
  const expirationTime = exp * 1000; // Convert to milliseconds
  const now = Date.now();
  const minutesUntilExpiration = (expirationTime - now) / (1000 * 60);
  return minutesUntilExpiration <= minutes;
}

/**
 * Get time until token expiration in seconds
 */
export function getTimeUntilExpiration(token: string): number | null {
  const exp = getTokenExpiration(token);
  if (!exp) {
    return null;
  }
  const expirationTime = exp * 1000; // Convert to milliseconds
  const now = Date.now();
  return Math.max(0, Math.floor((expirationTime - now) / 1000));
}
