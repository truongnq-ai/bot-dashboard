/**
 * API Client
 * 
 * Axios instance with interceptors for authentication and error handling.
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getApiBaseUrl, getApiTimeout } from '../config/api.config';
import { isTokenExpiringSoon } from '../utils/jwt';

// Refresh token queue to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Token cache to prevent excessive API calls
let cachedToken: string | null = null;
let tokenCacheTime: number = 0;
const TOKEN_CACHE_DURATION = 30 * 1000; // Cache for 30 seconds

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Get access token from API route (server-side proxy)
 * Since httpOnly cookies cannot be read from client-side,
 * we need to call an API route to get the token.
 * Uses caching to prevent excessive API calls.
 */
async function getAccessToken(): Promise<string | null> {
  // Return cached token if still valid
  const now = Date.now();
  if (cachedToken && (now - tokenCacheTime) < TOKEN_CACHE_DURATION) {
    return cachedToken;
  }
  
  try {
    const response = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      cachedToken = null;
      tokenCacheTime = 0;
      return null;
    }
    
    const data = await response.json();
    const token = data.token || null;
    
    // Cache the token
    if (token) {
      cachedToken = token;
      tokenCacheTime = now;
    } else {
      cachedToken = null;
      tokenCacheTime = 0;
    }
    
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    cachedToken = null;
    tokenCacheTime = 0;
    return null;
  }
}

/**
 * Refresh access token
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.data?.accessToken || null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

// Create axios instance — baseURL được set dynamically trong interceptor
// Browser: /api/proxy (Next.js rewrites → VPS)
// Server-side: http://171.244.10.135/api/v1 (direct)
const apiClient: AxiosInstance = axios.create({
  timeout: getApiTimeout(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: Set baseURL dynamically + Add access token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Set baseURL dynamically mỗi request — đảm bảo đúng context
    if (!config.baseURL) {
      config.baseURL = getApiBaseUrl();
    }

    // Get access token from API route
    const token = await getAccessToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Proactive refresh: Check if token is expiring soon
      if (isTokenExpiringSoon(token, 5)) {
        // Token expires in less than 5 minutes, refresh it
        const newToken = await refreshAccessToken();
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, wait for the new token
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          // Update cache with new token
          cachedToken = newToken;
          tokenCacheTime = Date.now();
          
          onRefreshed(newToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          return apiClient(originalRequest);
        } else {
          // Clear cache on refresh failure
          cachedToken = null;
          tokenCacheTime = 0;
          // Refresh failed, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Clear cache on refresh error
        cachedToken = null;
        tokenCacheTime = 0;
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
