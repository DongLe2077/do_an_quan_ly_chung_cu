import api from './api';

const cuDanService = {
  getAll: () => api.get('/cudan'),
  getById: (id) => api.get(`/cudan/${id}`),
  getByPhong: (MaPhong) => api.get(`/cudan/phong/${MaPhong}`),
  getByNguoiDung: (MaNguoiDung) => api.get(`/cudan/nguoidung/${MaNguoiDung}`),
  create: (data) => api.post('/cudan', data),
  update: (id, data) => api.put(`/cudan/${id}`, data),
  delete: (id) => api.delete(`/cudan/${id}`),
};

export default cuDanService;
