/**
 * API Configuration — Bot Dashboard
 *
 * Browser KHÔNG gọi VPS trực tiếp.
 * Tất cả calls đi qua Next.js proxy (/api/proxy/*) → rewrites → VPS backend (server-side).
 *
 * Điều này giải quyết:
 *  - Mixed Content: browser chỉ thấy HTTPS Next.js host
 *  - CORS: request từ server → server, không cần CORS headers
 */

// Relative URL — browser gọi Next.js server (cùng domain/protocol)
// next.config.ts rewrites: /api/proxy/* → http://171.244.10.135/api/v1/*
const PROXY_BASE = '/api/proxy';

// Direct URL chỉ dùng trong Next.js API routes (server-side), không dùng cho browser
export const DIRECT_BACKEND_URL = 'http://171.244.10.135/api/v1';

export function getApiBaseUrl(): string {
  // Server-side (Next.js API routes): dùng direct URL để tránh self-loop
  if (typeof window === 'undefined') {
    return DIRECT_BACKEND_URL;
  }
  // Client-side (browser): dùng proxy URL (relative → same origin)
  return PROXY_BASE;
}

export function getApiTimeout(): number {
  return 30_000;
}

export const API_CONFIG = {
  baseUrl: getApiBaseUrl(),
  timeout: getApiTimeout(),
} as const;
