/**
 * API Configuration
 * 
 * API URLs are configured here, not in environment variables.
 * Environment variables should only contain secrets/keys for third-party services.
 */

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable or default
    return process.env.API_BASE_URL || 'http://localhost:8080/api';
  }
  
  // Client-side: use environment variable or default
  // In production, this can be injected at build time
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
}

export function getApiTimeout(): number {
  return parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || '30000', 10);
}

export const API_CONFIG = {
  baseUrl: getApiBaseUrl(),
  timeout: getApiTimeout(),
} as const;
