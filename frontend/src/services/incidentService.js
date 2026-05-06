import api from './api';

const incidentService = {
  getAll: () => api.get('/incidents'),
  getById: (id) => api.get(`/incidents/${id}`),
  getByTrangThai: (status) => api.get(`/incidents/status/${status}`),
  getByNguoiBao: (reporterId) => api.get(`/incidents/reporter/${reporterId}`),
  getByApartment: (apartmentId) => api.get(`/incidents/apartment/${apartmentId}`),
  create: (data) => api.post('/incidents', data),
  update: (id, data) => api.put(`/incidents/${id}`, data),
  xuLy: (id, data) => api.patch(`/incidents/${id}/handle`, data),
  delete: (id) => api.delete(`/incidents/${id}`),
};

export default incidentService;
