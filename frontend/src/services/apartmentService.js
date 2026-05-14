import api from './api';

const apartmentService = {
  getAll: (params) => api.get('/apartments', { params }),
  getById: (id) => api.get(`/apartments/${id}`),
  getByBuilding: (buildingId) => api.get(`/apartments/building/${buildingId}`),
  create: (data) => api.post('/apartments', data),
  update: (id, data) => api.put(`/apartments/${id}`, data),
  delete: (id) => api.delete(`/apartments/${id}`),
};

export default apartmentService;
