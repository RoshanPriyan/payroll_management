import axiosClient from '../services/axiosClient.js';

export const businessApi = {
  getBusinessById: () => axiosClient.get('/v1/business/byid'),
  updateBusinessById: (payload) => axiosClient.put('/v1/business/update-byid', payload),
};
