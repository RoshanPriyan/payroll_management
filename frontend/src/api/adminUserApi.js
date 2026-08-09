import axiosClient from '../services/axiosClient.js';

export const adminUserApi = {
  getUsers: () => axiosClient.get('/v1/admin/user-list'),
  registerUser: (payload) => axiosClient.post('/v1/admin/register', payload),
  updateStatus: (payload) => axiosClient.put('/v1/admin/status-update', payload),
};
