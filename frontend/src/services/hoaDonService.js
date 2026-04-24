import api from './api';

const hoaDonService = {
  getAll: () => api.get('/hoadon'),
  getById: (id) => api.get(`/hoadon/${id}`),
  getByPhong: (MaPhong) => api.get(`/hoadon/phong/${MaPhong}`),
  getByTrangThai: (TrangThai) => api.get(`/hoadon/trangthai/${TrangThai}`),
  create: (data) => api.post('/hoadon', data),
  update: (id, data) => api.put(`/hoadon/${id}`, data),
  thanhToan: (id, data) => api.patch(`/hoadon/${id}/thanhtoan`, data),
  xacNhanThanhToan: (id) => api.patch(`/hoadon/${id}/xacnhan`),
  tuChoiThanhToan: (id) => api.patch(`/hoadon/${id}/tuchoi`),
  tinhTienTuDong: (id) => api.put(`/hoadon/${id}/tinh-tien`),
  delete: (id) => api.delete(`/hoadon/${id}`),
};

export default hoaDonService;
