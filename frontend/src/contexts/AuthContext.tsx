import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { api } from '../lib/apiClient';
import { ENDPOINTS } from '../config/api.config';

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

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: { id: string; name: string; email: string; role: string };
  };
}

interface MeResponse {
  success: boolean;
  data: { id: string; name: string; email: string; role: string };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('ihm_user');
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Validate stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('ihm_token');
    if (!token) return;

    setIsLoading(true);
    api.get<MeResponse>(ENDPOINTS.AUTH.ME)
      .then((res) => {
        const u = res.data;
        const authUser: AuthUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as AuthUser['role'],
          token,
        };
        localStorage.setItem('ihm_user', JSON.stringify(authUser));
        setUser(authUser);
      })
      .catch(() => {
        localStorage.removeItem('ihm_token');
        localStorage.removeItem('ihm_user');
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, { email, password });
      const { token, user: u } = res.data;

      const authUser: AuthUser = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as AuthUser['role'],
        token,
      };

      localStorage.setItem('ihm_token', token);
      localStorage.setItem('ihm_user', JSON.stringify(authUser));
      setUser(authUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    api.post(ENDPOINTS.AUTH.LOGOUT, {}).catch(() => {});
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
