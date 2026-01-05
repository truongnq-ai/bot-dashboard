/**
 * Cookie Configuration
 * 
 * Centralized cookie names to prevent conflicts between different applications
 * running on the same domain (e.g., localhost with different ports)
 */

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'admin_accessToken',
  REFRESH_TOKEN: 'admin_refreshToken',
} as const;

