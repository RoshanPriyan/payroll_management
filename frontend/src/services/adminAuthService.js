import axiosClient from './axiosClient.js';
import {
  clearAuthSession,
  createSessionFromAuthData,
  getStoredAuthSession,
  persistAuthSession,
  ROLES,
} from './auth/authSession.js';

export const adminAuthService = {
  login: (payload) => axiosClient.post('/v1/admin/login', payload),
  isSuperAdminAuthenticated: () => (
    getStoredAuthSession()?.role === ROLES.SUPER_ADMIN
  ),
  storeSession: (adminData) => {
    persistAuthSession(createSessionFromAuthData(adminData, { role: ROLES.SUPER_ADMIN }));
  },
  logout: () => {
    clearAuthSession();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:logout'));
    }
  },
};
