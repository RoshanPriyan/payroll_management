import axiosClient from '../services/axiosClient.js';

export const attendanceApi = {
  getAttendance: (params) => axiosClient.get('/attendance', { params }),
  markAttendance: (payload) => axiosClient.post('/v1/worker/mark-attendance', payload),
  updateAttendance: (id, payload) => axiosClient.put(`/attendance/${id}`, payload),
};
