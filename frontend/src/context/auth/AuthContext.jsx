import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  clearAuthSession,
  createSessionFromAuthData,
  getStoredAuthSession,
  persistAuthSession,
} from '../../services/auth/authSession.js';
import { AuthContext } from './authContextCore.js';

const initialAuthState = {
  token: '',
  user_id: '',
  tenant_id: '',
  role: '',
  user: null,
  isAuthenticated: false,
};

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => getStoredAuthSession() || initialAuthState);

  const login = useCallback((authData, fallback = {}) => {
    const nextSession = createSessionFromAuthData(authData, fallback);

    if (!nextSession.isAuthenticated) {
      clearAuthSession();
      setAuthState(initialAuthState);
      return initialAuthState;
    }

    persistAuthSession(nextSession);
    setAuthState(nextSession);
    return nextSession;
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setAuthState(initialAuthState);
  }, []);

  const isAuthenticated = useCallback(() => {
    const storedSession = getStoredAuthSession();
    return Boolean(storedSession);
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setAuthState(initialAuthState);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    window.addEventListener('auth:logout', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
      window.removeEventListener('auth:logout', handleSessionExpired);
    };
  }, []);

  const value = useMemo(
    () => ({
      ...authState,
      authenticated: authState.isAuthenticated,
      login,
      logout,
      isAuthenticated,
    }),
    [authState, isAuthenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
