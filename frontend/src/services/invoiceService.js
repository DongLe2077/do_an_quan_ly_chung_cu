import api from './api';

const invoiceService = {
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`),
  getByApartment: (apartmentId) => api.get(`/invoices/apartment/${apartmentId}`),
  getByTrangThai: (status) => api.get(`/invoices/status/${status}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  thanhToan: (id, data) => api.patch(`/invoices/${id}/pay`, data),
  xacNhanThanhToan: (id) => api.patch(`/invoices/${id}/confirm`),
  tuChoiThanhToan: (id) => api.patch(`/invoices/${id}/reject`),
  tinhTienTuDong: (id) => api.put(`/invoices/${id}/calculate`),
  delete: (id) => api.delete(`/invoices/${id}`),
};

export default invoiceService;
