import axiosClient from '../services/axiosClient.js';

export const paymentApi = {
  getPayments: (params) => axiosClient.get('/payments', { params }),
  getPaymentById: (id) => axiosClient.get(`/payments/${id}`),
  processDailyPayment: (payload) => axiosClient.post('/payments/daily', payload),
  processWeeklyPayment: (payload) => axiosClient.post('/payments/weekly', payload),
  exportPayments: (params) => axiosClient.get('/payments/export', { params, responseType: 'blob' }),
};
