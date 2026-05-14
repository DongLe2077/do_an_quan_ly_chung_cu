import api from './api';

const residentService = {
  getAll: (params) => api.get('/residents', { params }),
  getById: (id) => api.get(`/residents/${id}`),
  getByApartment: (apartmentId) => api.get(`/residents/apartment/${apartmentId}`),
  getByUser: (userId) => api.get(`/residents/user/${userId}`),
  create: (data) => api.post('/residents', data),
  update: (id, data) => api.put(`/residents/${id}`, data),
  delete: (id) => api.delete(`/residents/${id}`),
};

export default residentService;
