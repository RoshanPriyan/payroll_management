import axiosClient from './axiosClient.js';

export const authService = {
  login: (payload) => axiosClient.post('/v1/users/login', payload),
  register: (payload) => axiosClient.post('/v1/users/register', payload),
  me: () => axiosClient.get('/auth/me'),
  getUserDetail: (userId) => axiosClient.get('/v1/users/user-detail', { params: { user_id: userId } }),
  updateUserProfile: (payload) => axiosClient.put('/v1/users/update-user-profile', payload),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
  },
};
