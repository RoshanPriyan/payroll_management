import axiosClient from '../services/axiosClient.js';

export const workerApi = {
  getWorkers: (params) => axiosClient.get('/workers', { params }),
  getWorkerById: (id) => axiosClient.get(`/workers/${id}`),
  createWorker: (payload) => axiosClient.post('/workers', payload),
  updateWorker: (id, payload) => axiosClient.put(`/workers/${id}`, payload),
  deleteWorker: (id) => axiosClient.delete(`/workers/${id}`),
};
