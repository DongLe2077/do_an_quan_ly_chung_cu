import api from './api';

const userService = {
  login: (data) => api.post('/users/login', data),
  register: (data) => api.post('/users/register', data),
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  getProfile: () => api.get('/users/me/profile'),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  changePassword: (id, data) => api.put(`/users/${id}/password`, data),
  setRole: (id, data) => api.patch(`/users/${id}/role`, data),
};

export default userService;
