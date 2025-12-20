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
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.token || null;
  } catch (error) {
    console.error('Error getting access token:', error);
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

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: getApiTimeout(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Request interceptor: Add access token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
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
          onRefreshed(newToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          return apiClient(originalRequest);
        } else {
          // Refresh failed, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
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
