'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authService } from '@/services/auth.service';
import { queryClient } from '@/lib/queryClient';
import type { User, LoginInput, RegisterInput, AuthResponse } from '@/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: {
    (input: LoginInput): Promise<AuthResponse>;
    (email: string, password: string): Promise<AuthResponse>;
  };
  register: {
    (input: RegisterInput): Promise<AuthResponse>;
    (name: string, email: string, password: string): Promise<AuthResponse>;
    (email: string, password: string): Promise<AuthResponse>;
  };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

const getSavedToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return Cookies.get('pet-shop-token') || null;
};

const getSavedUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const saved = Cookies.get('pet-shop-user');
  if (saved) {
    try {
      return JSON.parse(saved) as User;
    } catch {
      return null;
    }
  }
  return null;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(getSavedUser);
  const [token, setToken] = useState<string | null>(getSavedToken);
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!Cookies.get('pet-shop-token');
  });

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';

  // Verify/refresh auth on mount in background without blocking initial UI
  useEffect(() => {
    let isMounted = true;
    const restoreAuth = async () => {
      try {
        const savedToken = Cookies.get('pet-shop-token');
        const savedUser = Cookies.get('pet-shop-user');

        if (savedToken) {
          setLoading(true);
          if (savedUser) {
            try {
              const parsed = JSON.parse(savedUser) as User;
              if (isMounted) {
                setUser((curr) => curr || parsed);
                setToken((curr) => curr || savedToken);
              }
            } catch {
              // ignore parse error
            }
          }

          // Verify token is still valid in background
          const { data } = await authService.getMe();
          if (isMounted && data) {
            setUser(data);
            Cookies.set('pet-shop-user', JSON.stringify(data), { expires: 7 });
          }
        }
      } catch {
        // Token expired or invalid
        Cookies.remove('pet-shop-token');
        Cookies.remove('pet-shop-user');
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void restoreAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (arg1: LoginInput | string, arg2?: string): Promise<AuthResponse> => {
      let input: LoginInput;
      if (typeof arg1 === 'string') {
        input = { email: arg1, password: arg2 || '' };
      } else {
        input = arg1;
      }

      setLoading(true);
      try {
        const response = await authService.login(input);
        if (response.success) {
          const { user: userData, token: userToken } = response.data;
          setUser(userData);
          setToken(userToken);
          Cookies.set('pet-shop-token', userToken, { expires: 7 });
          Cookies.set('pet-shop-user', JSON.stringify(userData), { expires: 7 });
        }
        return response;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (arg1: RegisterInput | string, arg2?: string, arg3?: string): Promise<AuthResponse> => {
      let input: RegisterInput;
      if (typeof arg1 === 'string') {
        if (arg3 !== undefined) {
          input = { name: arg1, email: arg2 || '', password: arg3 };
        } else if (arg2 !== undefined) {
          const derivedName = arg1.split('@')[0] || 'User';
          input = { name: derivedName, email: arg1, password: arg2 };
        } else {
          input = { name: '', email: arg1, password: '' };
        }
      } else {
        input = arg1;
      }

      setLoading(true);
      try {
        const response = await authService.register(input);
        if (response.success) {
          const { user: userData, token: userToken } = response.data;
          setUser(userData);
          setToken(userToken);
          Cookies.set('pet-shop-token', userToken, { expires: 7 });
          Cookies.set('pet-shop-user', JSON.stringify(userData), { expires: 7 });
        }
        return response;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setLoading(false);
    Cookies.remove('pet-shop-token');
    Cookies.remove('pet-shop-user');
    queryClient.clear(); // Clear all cached React Query queries to isolate data
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
