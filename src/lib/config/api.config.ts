/**
 * API Configuration
 * 
 * API URLs are configured here, not in environment variables.
 * Environment variables should only contain secrets/keys for third-party services.
 */

// Production API URL (base domain only, without /api)
const PRODUCTION_API_URL = 'https://apitutor.dienluc.vn';
// Development API URL
const DEVELOPMENT_API_URL = 'https://apitutor.dienluc.vn';

export function getApiBaseUrl(): string {
  // Determine default URL based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  const defaultUrl = isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;
  
  if (typeof window === 'undefined') {
    // Server-side: use environment variable or default based on NODE_ENV
    return process.env.API_BASE_URL || defaultUrl;
  }
  
  // Client-side: use environment variable or default based on NODE_ENV
  // In production, this can be injected at build time
  return process.env.NEXT_PUBLIC_API_BASE_URL || defaultUrl;
}

export function getApiTimeout(): number {
  return parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || '60000', 10);
}

export const API_CONFIG = {
  baseUrl: getApiBaseUrl(),
  timeout: getApiTimeout(),
} as const;
