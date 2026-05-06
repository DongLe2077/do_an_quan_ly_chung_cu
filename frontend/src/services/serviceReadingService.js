import api from './api';

const serviceReadingService = {
  getAll: () => api.get('/service-readings'),
  getById: (id) => api.get(`/service-readings/${id}`),
  getByInvoice: (invoiceId) => api.get(`/service-readings/invoice/${invoiceId}`),
  getByNgayGhi: (readingDate) => api.get(`/service-readings/date/${readingDate}`),
  create: (data) => api.post('/service-readings', data),
  update: (id, data) => api.put(`/service-readings/${id}`, data),
  delete: (id) => api.delete(`/service-readings/${id}`),
};

export default serviceReadingService;
