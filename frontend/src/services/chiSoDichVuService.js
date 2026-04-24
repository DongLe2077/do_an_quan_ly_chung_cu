import api from './api';

const chiSoDichVuService = {
  getAll: () => api.get('/chisodichvu'),
  getById: (id) => api.get(`/chisodichvu/${id}`),
  getByHoaDon: (MaHoaDon) => api.get(`/chisodichvu/hoadon/${MaHoaDon}`),
  getByNgayGhi: (NgayGhi) => api.get(`/chisodichvu/ngayghi/${NgayGhi}`),
  create: (data) => api.post('/chisodichvu', data),
  update: (id, data) => api.put(`/chisodichvu/${id}`, data),
  delete: (id) => api.delete(`/chisodichvu/${id}`),
};

export default chiSoDichVuService;
