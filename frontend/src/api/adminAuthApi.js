import { adminAuthService } from '../services/adminAuthService.js';

export const adminAuthApi = {
  login: adminAuthService.login,
  logout: adminAuthService.logout,
};
