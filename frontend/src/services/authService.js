import axiosClient from './axiosClient.js';
import { clearAuthSession } from './auth/authSession.js';

export const authService = {
  login: (payload) => axiosClient.post('/v1/users/login', payload),
  register: (payload) => axiosClient.post('/v1/users/register', payload),
  activateAccount: (token, config = {}) => axiosClient.put('/v1/users/active-status', { token }, config),
  resendActivationEmail: (email, config = {}) => axiosClient.post('/v1/users/resend-activation', { email }, config),
  createPaymentOrder: (payload) => axiosClient.post('/v1/payment/create-order', payload),
  verifyPayment: (payload) => axiosClient.post('/v1/payment/verify', payload),
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
