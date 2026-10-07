import axiosClient from '../services/axiosClient.js';

export const attendanceApi = {
  getAttendance: (params) => axiosClient.get('/attendance', { params }),
  markAttendance: (payload) => axiosClient.post('/v1/worker/mark-attendance', payload),
  updateAttendance: (id, payload) => axiosClient.put(`/attendance/${id}`, payload),
  updateWorkerAttendance: (payload) => axiosClient.put('/v1/worker/update-attendance', payload),
  getAttendanceHistory: (payload) => axiosClient.post('/v1/worker/attendance-history', payload),
};
