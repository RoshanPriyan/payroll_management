import axiosClient from './axiosClient.js';

const ADMIN_AUTH_KEYS = ['access_token', 'role', 'user_id', 'first_name', 'last_name'];

export const adminAuthService = {
  login: (payload) => axiosClient.post('/v1/admin/login', payload),
  isSuperAdminAuthenticated: () => (
    Boolean(localStorage.getItem('access_token')) && localStorage.getItem('role') === 'SUPER_ADMIN'
  ),
  storeSession: (adminData) => {
    localStorage.setItem('access_token', adminData.access_token);
    localStorage.setItem('role', adminData.role);
    localStorage.setItem('user_id', String(adminData.user_id));
    localStorage.setItem('first_name', adminData.first_name || '');
    localStorage.setItem('last_name', adminData.last_name || '');
  },
  logout: () => {
    ADMIN_AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
  },
};
