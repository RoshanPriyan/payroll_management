import axiosClient from '../services/axiosClient.js';

export const adminAuditLogApi = {
  getAuditLogs: (payload) => axiosClient.post('/v1/audit/logs', payload),
  getTenants: () => axiosClient.get('/v1/admin/tenant-list'),
};
