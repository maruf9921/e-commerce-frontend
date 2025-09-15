'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getAuthApiUrl } from '@/config/api';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Configure axios for credentials
axios.defaults.withCredentials = true;
axios.defaults.timeout = 10000;

// Global state for token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
  isAuthenticated: boolean;
  refreshToken: () => Promise<boolean>;
  redirectToDashboard: (redirectUrl?: string) => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  role: string;
}

// Helper function to handle failed requests queue
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Check if user is logged in on app start
  useEffect(() => {
    // Only check auth status if we're not on the login page to avoid redirect loops
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async (silent: boolean = false) => {
    try {
      console.log('Checking auth status...', getAuthApiUrl());
      const response = await axios.get(`${getAuthApiUrl()}/profile`, {
        withCredentials: true,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Auth response:', response.data);
      const data = response.data as any;
      const userData = data?.user || data;
      
      if (userData && userData.id) {
        setUser(userData);
        console.log('User authenticated:', userData);
      } else {
        console.log('No user data in response');
        setUser(null);
      }
    } catch (error: any) {
      console.log('Auth check failed:', error.response?.status, error.message);
      
      // Don't immediately clear user on auth check failure after successful login
      if (!silent && error.response?.status === 401) {
        // Only clear user and redirect if we're not in the middle of a login process
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          console.log('Session expired, redirecting to login');
          setUser(null);
          router.push('/login?expired=true');
        } else if (silent) {
          // For silent checks, just log but don't redirect
          console.log('Silent auth check failed, but not redirecting');
        }
      } else if (!silent) {
        // For non-401 errors or non-silent checks, clear user
        setUser(null);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      
      console.log('Attempting login for:', email);
      const response = await axios.post(`${getAuthApiUrl()}/login`, {
        email,
        password
      }, {
        withCredentials: true,
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Login response:', response.data);
      const data = response.data as any;
      
      if (data.user) {
        // User data returned directly - set user immediately
        setUser(data.user);
        console.log('Login successful, user set:', data.user);
        return { success: true, message: data.message || 'Login successful!' };
      } else if (data.access_token) {
        // Token returned, wait a moment for cookie to be set, then fetch profile
        console.log('Token received, waiting for cookie setup...');
        
        // Wait a short moment for the cookie to be properly set
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Now try to get user profile
        try {
          const profileResponse = await axios.get(`${getAuthApiUrl()}/profile`, {
            withCredentials: true,
            timeout: 10000
          });
          
          const profileData = profileResponse.data as any;
          const userData = profileData?.user || profileData;
          
          if (userData && userData.id) {
            setUser(userData);
            console.log('Profile fetched successfully:', userData);
            return { success: true, message: 'Login successful!' };
          }
        } catch (profileError: any) {
          console.log('Profile fetch failed, but login seemed successful');
          // If profile fetch fails but we have a token, still consider it a success
          return { success: true, message: 'Login successful!' };
        }
        
        return { success: true, message: 'Login successful!' };
      } else {
        console.log('Login response missing user data');
        return { success: false, message: 'Login failed - no user data returned' };
      }
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      let message = 'Login failed';
      
      if (error.response?.data?.message) {
        message = Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ')
          : error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const redirectToDashboard = (redirectUrl?: string) => {
    console.log('Redirecting to dashboard...', { user, redirectUrl });
    
    if (!user) {
      console.log('No user found, redirecting to login');
      router.push('/login');
      return;
    }

    // If a specific redirect URL was provided (from URL params), use it
    if (redirectUrl && redirectUrl !== '/login' && redirectUrl.startsWith('/')) {
      console.log('Using provided redirect URL:', redirectUrl);
      router.push(redirectUrl);
      return;
    }

    // Role-based dashboard routing
    const userRole = user.role?.toLowerCase();
    console.log('User role:', userRole);
    
    let dashboardUrl = '/user/dashboard'; // Default fallback
    
    switch (userRole) {
      case 'admin':
        dashboardUrl = '/dashboard/admin';
        break;
      case 'seller':
        dashboardUrl = '/seller/dashboard';
        break;
      case 'user':
      default:
        dashboardUrl = '/user/dashboard';
        break;
    }
    
    console.log('Redirecting to:', dashboardUrl);
    router.push(dashboardUrl);
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      const response = await axios.post(`${getAuthApiUrl()}/register`, userData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = response.data as any;
      if (data.user || data.access_token) {
        // Auto-login after registration
        if (data.access_token && !data.user) {
          await checkAuthStatus();
        } else {
          setUser(data.user);
        }
        return { success: true, message: 'Registration successful!' };
      } else {
        return { success: false, message: 'Registration completed but login failed' };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      let message = 'Registration failed';
      
      if (error.response?.data?.message) {
        message = Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ')
          : error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await axios.post(`${getAuthApiUrl()}/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    loading,
    isAuthenticated,
    redirectToDashboard,
    refreshToken: function (): Promise<boolean> {
      throw new Error('Function not implemented.');
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}