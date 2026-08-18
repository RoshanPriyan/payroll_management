import axiosClient from './axiosClient.js';
import { clearAuthSession } from './auth/authSession.js';

export const authService = {
  login: (payload) => axiosClient.post('/v1/users/login', payload),
  register: (payload) => axiosClient.post('/v1/users/register', payload),
  me: () => axiosClient.get('/auth/me'),
  getUserDetail: (userId) => axiosClient.get('/v1/users/user-detail', { params: { user_id: userId } }),
  updateUserProfile: (payload) => axiosClient.put('/v1/users/update-user-profile', payload),
  logout: () => {
    clearAuthSession();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:logout'));
    }
  },
};
