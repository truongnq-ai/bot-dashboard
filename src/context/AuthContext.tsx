/**
 * Authentication Context
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { login, logout as logoutService } from '@/lib/api/auth.service';
import { ResponseObject } from '@/types/common';
import { AuthenticationResponse } from '@/types/auth';

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
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
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
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error(response.errorDetail || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
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
