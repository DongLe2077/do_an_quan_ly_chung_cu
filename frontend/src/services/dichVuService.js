import api from './api';

const dichVuService = {
  getAll: () => api.get('/danhsachdichvu'),
  getById: (id) => api.get(`/danhsachdichvu/${id}`),
  create: (data) => api.post('/danhsachdichvu', data),
  update: (id, data) => api.put(`/danhsachdichvu/${id}`, data),
  delete: (id) => api.delete(`/danhsachdichvu/${id}`),
};

export default dichVuService;
