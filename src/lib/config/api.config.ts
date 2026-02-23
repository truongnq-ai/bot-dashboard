/**
 * API Configuration — Bot Dashboard
 * Backend: bot-core-service trên VPS
 *
 * PRODUCTION : http://171.244.10.135/api/v1
 * LOCAL DEV  : http://localhost:6388/api/v1
 *
 * Cấu hình trực tiếp trong code, không dùng .env
 */

const PRODUCTION_API_URL  = 'http://171.244.10.135/api/v1';
const DEVELOPMENT_API_URL = 'http://localhost:6388/api/v1';

export function getApiBaseUrl(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;
}

export function getApiTimeout(): number {
  return 30_000; // 30 giây
}

export const API_CONFIG = {
  baseUrl: getApiBaseUrl(),
  timeout: getApiTimeout(),
} as const;
