/**
 * Authentication Context
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { login, logout as logoutService } from '@/lib/api/auth.service';
import { ResponseObject } from '@/types/common';
import { AuthenticationResponse } from '@/types/auth';
import { showError } from '@/lib/utils/toast';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { sub?: string } | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ sub?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include',
      });
      
      let data = await response.json();
      
      // If not authenticated, try silent refresh
      if (!response.ok || !data.isAuthenticated) {
        try {
          // Attempt silent refresh
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (refreshResponse.ok) {
            // Refresh success, re-run checkAuth to get user info
            const secondCheck = await fetch('/api/auth/check', {
              method: 'GET',
              credentials: 'include',
            });
            if (secondCheck.ok) {
              data = await secondCheck.json();
            }
          }
        } catch (refreshError) {
          console.error('Silent refresh error:', refreshError);
        }
      }
      
      if (data.isAuthenticated) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Check auth error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = useCallback(async (username: string, password: string) => {
    try {
      setLoading(true);
      const response: ResponseObject<AuthenticationResponse> = await login(username, password);
      
      if (response.errorCode === '0000') {
        setIsAuthenticated(true);
        
        // Get redirect parameter from URL
        const redirectPath = typeof window !== 'undefined' 
          ? new URLSearchParams(window.location.search).get('redirect')
          : null;
        
        // Use redirect parameter or default to dashboard
        const targetPath = redirectPath && redirectPath.startsWith('/') 
          ? decodeURIComponent(redirectPath)
          : '/dashboard';
        
        // Refresh router to ensure middleware sees the new cookies
        router.refresh();
        
        // Small delay to ensure cookies are available for middleware
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Navigate to target path
        router.push(targetPath);
      } else {
        const errorMessage = response.errorDetail || 'Login failed';
        showError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error && !error.message.includes('Login failed')) {
        showError(error.message || 'Login failed. Please check your credentials.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
      await logoutService();
      setIsAuthenticated(false);
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setIsAuthenticated(false);
      setUser(null);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login: handleLogin,
        logout: handleLogout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
