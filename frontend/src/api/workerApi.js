import axiosClient from '../services/axiosClient.js';

export const workerApi = {
  getWorkers: (params) => axiosClient.get('/v1/worker/list', { params }),
  getAttendanceSummary: () => axiosClient.get('/v1/worker/attendance-summary'),
  getWorkerById: (id) => axiosClient.get('/v1/worker/byid', { params: { worker_id: id } }),
  createWorker: (payload) => axiosClient.post('/v1/worker/register', payload),
  updateWorker: (payload) => axiosClient.put('/v1/worker/update-worker', payload),
  deleteWorker: (id) => axiosClient.delete('/v1/worker/delete-worker', { params: { worker_id: id } }),
};
