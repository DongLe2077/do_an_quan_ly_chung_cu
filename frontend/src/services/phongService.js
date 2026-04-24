import api from './api';

const phongService = {
  getAll: () => api.get('/phong'),
  getById: (id) => api.get(`/phong/${id}`),
  getByToaNha: (MaToaNha) => api.get(`/phong/toanha/${MaToaNha}`),
  create: (data) => api.post('/phong', data),
  update: (id, data) => api.put(`/phong/${id}`, data),
  delete: (id) => api.delete(`/phong/${id}`),
};

export default phongService;
