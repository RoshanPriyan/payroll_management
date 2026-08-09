import { authService } from '../services/authService.js';

export const authApi = {
  login: authService.login,
  register: authService.register,
  me: authService.me,
  getUserDetail: authService.getUserDetail,
  updateUserProfile: authService.updateUserProfile,
  logout: authService.logout,
};
