import api from './api';

const suCoService = {
  getAll: () => api.get('/suco'),
  getById: (id) => api.get(`/suco/${id}`),
  getByTrangThai: (TrangThai) => api.get(`/suco/trangthai/${TrangThai}`),
  getByNguoiBao: (MaNguoiBao) => api.get(`/suco/nguoibao/${MaNguoiBao}`),
  getByPhong: (MaPhong) => api.get(`/suco/phong/${MaPhong}`),
  create: (data) => api.post('/suco', data),
  update: (id, data) => api.put(`/suco/${id}`, data),
  xuLy: (id, data) => api.patch(`/suco/${id}/xuly`, data),
  delete: (id) => api.delete(`/suco/${id}`),
};

export default suCoService;
