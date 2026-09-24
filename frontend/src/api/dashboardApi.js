import axiosClient from '../services/axiosClient.js';

export const dashboardApi = {
  getPayrollWidgets: () => axiosClient.get('/v1/dashboard/payroll-widgets'),
};
