import api from './api';

const toaNhaService = {
  getAll: () => api.get('/toanha'),
  getById: (id) => api.get(`/toanha/${id}`),
  create: (data) => api.post('/toanha', data),
  update: (id, data) => api.put(`/toanha/${id}`, data),
  delete: (id) => api.delete(`/toanha/${id}`),
};

export default toaNhaService;
