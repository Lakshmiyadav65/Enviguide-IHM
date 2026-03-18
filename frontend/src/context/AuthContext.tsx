// ============================================================
// IHM Platform - Auth Context
// ============================================================
// Provides authentication state and handlers across the app.
// Replace localStorage logic with real API calls when backend is live.

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('ihm_user');
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API call when backend is ready
      // const data = await api.post<{ user: AuthUser }>('/auth/login', { email, password });
      // const authUser = data.user;

      // --- MOCK (remove when backend is connected) ---
      const mockUser: AuthUser = {
        id: '1',
        name: 'Admin User',
        email,
        role: 'admin',
        token: 'mock-jwt-token',
      };
      // -----------------------------------------------

      localStorage.setItem('ihm_token', mockUser.token);
      localStorage.setItem('ihm_user', JSON.stringify(mockUser));
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ihm_token');
    localStorage.removeItem('ihm_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
