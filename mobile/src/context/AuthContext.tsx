import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api, Role, TokenResponse } from '../services/api';

type AuthState = {
  token: string | null;
  role: Role | null;
  displayName: string | null;
  email: string | null;
  loading: boolean;
  error: string | null;
  login: (persona: 'family' | 'staff') => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (persona: 'family' | 'staff') => {
    setLoading(true);
    setError(null);
    try {
      const res: TokenResponse = await api.demoLogin(persona);
      setToken(res.access_token);
      setRole(res.role);
      setDisplayName(res.display_name);
      setEmail(res.email);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setRole(null);
    setDisplayName(null);
    setEmail(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      token,
      role,
      displayName,
      email,
      loading,
      error,
      login,
      logout,
      clearError,
    }),
    [token, role, displayName, email, loading, error, login, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
