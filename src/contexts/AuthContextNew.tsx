'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Types
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
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; needsVerification?: boolean }>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
  refreshAuth: () => Promise<boolean>;
  redirectToDashboard: () => void;
  checkVerificationStatus: (email: string) => Promise<{ needsVerification: boolean; message: string }>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  role: string;
}

interface AuthResponse {
  user?: User;
  message?: string;
  needsVerification?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.timeout = 10000;

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Refresh authentication status with improved error handling
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    // Prevent concurrent refresh calls
    if (isRefreshing) {
      console.log('🔄 Refresh already in progress, skipping...');
      return false;
    }
    
    setIsRefreshing(true);
    try {
      console.log('🔄 Checking authentication status...');
      const response = await apiClient.get<AuthResponse>('/auth/profile');
      const userData = response.data?.user;
      
      if (userData) {
        console.log('✅ User authenticated:', userData.role, userData.email);
        setUser(userData);
        setAuthInitialized(true);
        return true;
      } else {
        console.log('❌ No user data returned');
        setUser(null);
        setAuthInitialized(true);
        return false;
      }
    } catch (error: any) {
      console.log('🔍 Auth check failed:', error.response?.status, error.message);
      
      if (error.response?.status === 401) {
        // Try to refresh tokens
        try {
          console.log('🔄 Attempting token refresh...');
          await apiClient.post('/auth/refresh');
          console.log('✅ Token refresh successful, retrying profile...');
          
          // Retry getting profile after refresh
          const response = await apiClient.get<AuthResponse>('/auth/profile');
          const userData = response.data?.user;
          
          if (userData) {
            console.log('✅ User authenticated after refresh:', userData.role, userData.email);
            setUser(userData);
            setAuthInitialized(true);
            return true;
          }
        } catch (refreshError) {
          console.log('❌ Token refresh failed:', refreshError);
          setUser(null);
          setAuthInitialized(true);
        }
      } else {
        setUser(null);
        setAuthInitialized(true);
      }
      
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, []); // Remove isRefreshing dependency to prevent unnecessary re-creation

  // Setup axios interceptors with improved handling
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        console.log('📡 API Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => {
        console.log('✅ API Response:', response.status, response.config.url);
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        console.log('❌ API Error:', error.response?.status, originalRequest.url);

        if (error.response?.status === 401 && !originalRequest._retry && authInitialized) {
          originalRequest._retry = true;

          try {
            console.log('🔄 Auto-refreshing token for failed request...');
            // Try to refresh the token
            await apiClient.post('/auth/refresh');
            console.log('✅ Auto-refresh successful, retrying request...');
            // Retry the original request
            return apiClient(originalRequest);
          } catch (refreshError) {
            console.log('❌ Auto-refresh failed, logging out...');
            // Refresh failed, clear user state
            setUser(null);
            // Only redirect if we're not already on login page and window is available
            if (typeof window !== 'undefined' && 
                !window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/signup')) {
              router.push('/login?expired=true');
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [router, authInitialized]);

  // Initial auth check with persistence fix
  useEffect(() => {
    // Prevent multiple initializations
    if (authInitialized) return;

    const checkAuth = async () => {
      console.log('🚀 Initializing authentication...');
      setLoading(true);
      
      // Add a small delay to prevent race conditions on page refresh
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await refreshAuth();
      setLoading(false);
      console.log('✅ Authentication initialization complete');
    };

    // Use a flag to prevent multiple simultaneous calls
    let isInitializing = false;
    if (!isInitializing) {
      isInitializing = true;
      checkAuth().finally(() => {
        isInitializing = false;
      });
    }
  }, []); // Remove refreshAuth dependency to prevent re-runs

  // Check verification status for seller accounts
  const checkVerificationStatus = async (email: string): Promise<{ needsVerification: boolean; message: string }> => {
    try {
      const response = await apiClient.post('/auth/check-verification', { email });
      return response.data as { needsVerification: boolean; message: string; };
    } catch (error: any) {
      return {
        needsVerification: false,
        message: 'Unable to check verification status'
      };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string; needsVerification?: boolean }> => {
    try {
      setLoading(true);
      console.log('🔐 Attempting login for:', email);
      
      const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      const userData = response.data?.user;

      if (userData) {
        console.log('✅ Login successful for:', userData.role, userData.email);
        setUser(userData);
        setAuthInitialized(true);
        return { success: true, message: response.data.message || 'Login successful!' };
      } else {
        console.log('❌ Login failed - no user data');
        return { success: false, message: 'Login failed - no user data returned' };
      }
    } catch (error: any) {
      console.error('❌ Login error:', error.response?.status, error.response?.data?.message);
      
      let message = 'Login failed';
      let needsVerification = false;
      
      if (error.response?.data?.message) {
        message = Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ')
          : error.response.data.message;
          
        // Check for seller verification messages
        if (message.includes('pending verification') || message.includes('not verified')) {
          needsVerification = true;
        }
      } else if (error.message) {
        message = error.message;
      }
      
      return { success: false, message, needsVerification };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      console.log('📝 Attempting registration for:', userData.email, 'as', userData.role);
      
      let endpoint = '/auth/register';
      
      // Use specific seller registration endpoint if role is seller
      if (userData.role?.toLowerCase() === 'seller') {
        endpoint = '/users/register-seller';
      }
      
      const response = await apiClient.post(endpoint, userData);
      
      console.log('✅ Registration successful');
      return { 
        success: true, 
        message: (response.data as any)?.message || 'Registration successful! Please log in.' 
      };
    } catch (error: any) {
      console.error('❌ Registration error:', error.response?.status, error.response?.data?.message);
      
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
      console.log('🚪 Logging out user...');
      await apiClient.post('/auth/logout');
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setUser(null);
      setAuthInitialized(false);
      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Force clear any localStorage if used elsewhere
        localStorage.clear();
      }
      router.push('/login');
    }
  };

  const redirectToDashboard = () => {
    if (!user) {
      console.log('🔄 No user found, redirecting to login');
      router.push('/login');
      return;
    }

    // Check verification status for sellers
    if (user.role?.toLowerCase() === 'seller' && !user.isVerified) {
      console.log('⚠️ Seller not verified, redirecting to verification page');
      router.push('/seller/verification-pending');
      return;
    }

    // Role-based dashboard routing
    const userRole = user.role?.toLowerCase();
    console.log('🚀 Redirecting to dashboard for role:', userRole);
    
    switch (userRole) {
      case 'admin':
        router.push('/admin/dashboard');
        break;
      case 'seller':
        router.push('/seller/dashboard');
        break;
      case 'user':
      default:
        router.push('/user/dashboard');
        break;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    refreshAuth,
    redirectToDashboard,
    checkVerificationStatus,
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
