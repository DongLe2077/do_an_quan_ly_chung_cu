import api from './api';

const nguoiDungService = {
  login: (data) => api.post('/nguoidung/login', data),
  register: (data) => api.post('/nguoidung/register', data),
  getAll: () => api.get('/nguoidung'),
  getById: (id) => api.get(`/nguoidung/${id}`),
  getProfile: () => api.get('/nguoidung/me/profile'),
  update: (id, data) => api.put(`/nguoidung/${id}`, data),
  delete: (id) => api.delete(`/nguoidung/${id}`),
  changePassword: (id, data) => api.put(`/nguoidung/${id}/password`, data),
  setRole: (id, data) => api.patch(`/nguoidung/${id}/role`, data),
};

export default nguoiDungService;
