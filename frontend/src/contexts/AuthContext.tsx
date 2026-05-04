import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { api } from '../lib/apiClient';
import { ENDPOINTS } from '../config/api.config';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer' | string;
  /** True for admin / superadmin accounts — bypasses permission checks. */
  isAdmin: boolean;
  /** Effective permission node ids (user grants ∪ role grants). Empty
   *  for non-admins until an admin grants something via Authorizations. */
  permissions: string[];
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True when permission node id is in the user's effective set, or
   *  when the user is an admin (in which case everything is allowed). */
  hasPermission: (nodeId: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Re-pull /auth/me — call after editing the current user's perms. */
  refresh: () => Promise<void>;
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
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    isAdmin?: boolean;
    permissions?: string[];
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

function meToAuthUser(d: MeResponse['data'], token: string): AuthUser {
  return {
    id: d.id,
    name: d.name,
    email: d.email,
    role: d.role as AuthUser['role'],
    isAdmin: !!d.isAdmin,
    permissions: Array.isArray(d.permissions) ? d.permissions : [],
    token,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('ihm_user');
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored) as AuthUser;
      // Backfill new fields on cached user objects from older builds.
      return {
        ...parsed,
        isAdmin: !!parsed.isAdmin,
        permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
      };
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchMe = useCallback(async (token: string) => {
    const res = await api.get<MeResponse>(ENDPOINTS.AUTH.ME);
    const u = meToAuthUser(res.data, token);
    localStorage.setItem('ihm_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  // Validate stored token + refresh permissions on mount.
  useEffect(() => {
    const token = localStorage.getItem('ihm_token');
    if (!token) return;

    setIsLoading(true);
    fetchMe(token)
      .catch(() => {
        localStorage.removeItem('ihm_token');
        localStorage.removeItem('ihm_user');
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [fetchMe]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Generous timeout — the first login after the backend has been
      // idle (Render Free) can take 30-50s while the service cold-starts.
      const res = await api.post<LoginResponse>(
        ENDPOINTS.AUTH.LOGIN,
        { email, password },
        { timeout: 60_000 },
      );
      const { token } = res.data;
      localStorage.setItem('ihm_token', token);
      // Pull /me right after login so we get permissions + isAdmin in one
      // place; the login response only carries the bare-minimum identity.
      await fetchMe(token);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMe]);

  const logout = useCallback(() => {
    api.post(ENDPOINTS.AUTH.LOGOUT, {}).catch(() => {});
    localStorage.removeItem('ihm_token');
    localStorage.removeItem('ihm_user');
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('ihm_token');
    if (!token) return;
    await fetchMe(token).catch(() => {});
  }, [fetchMe]);

  const hasPermission = useCallback((nodeId: string): boolean => {
    if (!user) return false;
    if (user.isAdmin) return true;
    return user.permissions.includes(nodeId);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        hasPermission,
        login,
        logout,
        refresh,
      }}
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
