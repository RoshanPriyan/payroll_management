import axiosClient from '../services/axiosClient.js';

export const adminAuditLogApi = {
  getAuditLogs: (params) => axiosClient.get('/v1/admin/audit-logs', { params }),
};
