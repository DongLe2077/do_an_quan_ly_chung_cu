'use client';

import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, message, Table, Card, Badge, Button, Space } from 'antd';
import hoaDonService from '@/services/hoaDonService';
import phongService from '@/services/phongService';
import cuDanService from '@/services/cuDanService';
import chiSoDichVuService from '@/services/chiSoDichVuService';
import useAuthStore from '@/store/authStore';
import dayjs from 'dayjs';
import PaymentModal from '@/components/PaymentModal';

export default function HoaDonPage() {
  const [data, setData] = useState([]);
  const [phongList, setPhongList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filterTrangThai, setFilterTrangThai] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [form] = Form.useForm();
  const { user } = useAuthStore();
  const isAdmin = user?.VaiTro === 'admin';
  const [cuDanInfo, setCuDanInfo] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

  useEffect(() => {
    if (user) {
      if (isAdmin) {
        fetchData();
        fetchPhong();
      } else {
        fetchResidentData();
      }
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await hoaDonService.getAll();
      setData(res.data?.data || []);
    } catch { message.error('Lỗi tải danh sách hóa đơn'); }
    finally { setLoading(false); }
  };

  const fetchResidentData = async () => {
    setLoading(true);
    try {
      const cdRes = await cuDanService.getByNguoiDung(user.MaNguoiDung);
      const cd = cdRes.data?.data;
      setCuDanInfo(cd);
      if (cd?.MaPhong) {
        const res = await hoaDonService.getByPhong(cd.MaPhong);
        setData(res.data?.data || []);
      }
    } catch { message.error('Lỗi tải dữ liệu cư dân'); }
    finally { setLoading(false); }
  };

  const fetchPhong = async () => {
    try { const res = await phongService.getAll(); setPhongList(res.data?.data || []); } catch {}
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        HanDongTien: values.HanDongTien ? values.HanDongTien.format('YYYY-MM-DD') : undefined,
      };
      if (editingRecord) {
        await hoaDonService.update(editingRecord.MaHoaDon, payload);
        message.success('Cập nhật hóa đơn thành công');
      } else {
        await hoaDonService.create(payload);
        message.success('Tạo hóa đơn thành công');
      }
      setModalOpen(false); form.resetFields(); setEditingRecord(null);
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Thao tác thất bại'); }
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setPaymentModalVisible(true);
  };

  const handlePaymentConfirm = async (phuongThuc) => {
    await hoaDonService.thanhToan(selectedInvoiceForPayment.MaHoaDon, { PhuongThuc: phuongThuc });
    if (isAdmin) fetchData(); else fetchResidentData();
  };

  const handleXacNhan = async (MaHoaDon) => {
    try {
      await hoaDonService.xacNhanThanhToan(MaHoaDon);
      message.success('Đã xác nhận thanh toán thành công');
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Xác nhận thất bại'); }
  };

  const handleTuChoi = async (MaHoaDon) => {
    if (!confirm('Xác nhận từ chối thanh toán này? Hóa đơn sẽ trở về trạng thái chưa thanh toán.')) return;
    try {
      await hoaDonService.tuChoiThanhToan(MaHoaDon);
      message.warning('Đã từ chối thanh toán');
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Từ chối thất bại'); }
  };

  const handleTinhTien = async (MaHoaDon) => {
    try {
      const res = await hoaDonService.tinhTienTuDong(MaHoaDon);
      message.success(`Tính tiền thành công! Tổng: ${Number(res.data?.data?.TongTien || 0).toLocaleString('vi-VN')} đ`);
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Tính tiền thất bại'); }
  };

  const handleViewDetails = async (record) => {
    setEditingRecord(record);
    setDetailModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await chiSoDichVuService.getByHoaDon(record.MaHoaDon);
      setInvoiceDetails(res.data?.data || []);
    } catch { message.error('Lỗi tải chi tiết dịch vụ'); }
    finally { setLoadingDetails(false); }
  };

  const handleDelete = async (MaHoaDon) => {
    if (!confirm('Xác nhận xóa hóa đơn này?')) return;
    try {
      await hoaDonService.delete(MaHoaDon);
      message.success('Xóa hóa đơn thành công');
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Xóa thất bại'); }
  };

  let filteredData = data;
  if (filterTrangThai) filteredData = filteredData.filter(h => h.TrangThai === filterTrangThai);
  if (filterMonth) filteredData = filteredData.filter(h => h.ThangThu?.includes(filterMonth));

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalPaid = data.filter(h => h.TrangThai === 'Đã thanh toán').length;
  const totalPending = data.filter(h => h.TrangThai === 'Chờ xác nhận').length;
  const totalUnpaid = data.filter(h => h.TrangThai === 'Chưa thanh toán').length;
  const totalInvoices = data.length;
  const paidPercent = totalInvoices > 0 ? Math.round((totalPaid / totalInvoices) * 100) : 0;

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const avatarColors = ['avatar-blue', 'avatar-green', 'avatar-purple', 'avatar-orange', 'avatar-teal'];

  // Get first invoice for summary display
  const firstInvoice = paginatedData[0];

  return (
    <div className="page-fade-in">
      {/* PAGE HEADER */}
      <div className="flex-between mb-24">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Hóa đơn & Thanh toán</h1>
          <p>{isAdmin ? 'Quản lý các khoản phí định kỳ cho cư dân.' : `Chào ${cuDanInfo?.HoTen || 'bạn'}, đây là danh sách hóa đơn phòng ${cuDanInfo?.SoPhong || ''}.`}</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: '1px solid var(--border-color)', borderRadius: 8, background: '#fff', fontSize: 13 }}>
          <span>📅</span>
          <select
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, cursor: 'pointer' }}
            value={filterMonth}
            onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Tất cả tháng</option>
            <option value="01/2026">Tháng 1, 2026</option>
            <option value="02/2026">Tháng 2, 2026</option>
            <option value="03/2026">Tháng 3, 2026</option>
            <option value="11/2023">Tháng 11, 2023</option>
          </select>
        </div>

        <select
          className="filter-select"
          value={filterTrangThai}
          onChange={(e) => { setFilterTrangThai(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đã thanh toán">Đã thanh toán</option>
          <option value="Chưa thanh toán">Chưa thanh toán</option>
          <option value="Chờ xác nhận">⏳ Chờ xác nhận</option>
        </select>

        {isAdmin && (
          <select className="filter-select">
            <option value="">Tất cả tòa nhà</option>
          </select>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => { setEditingRecord(null); form.resetFields(); setModalOpen(true); }}>
              + Tạo hóa đơn
            </button>
          )}
          {!isAdmin && (
            <div style={{ padding: '8px 16px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
              Cư dân: {cuDanInfo?.HoTen}
            </div>
          )}
        </div>
      </div>

      {/* INVOICE LIST/TABLE */}
      <div className="card invoice-container-main" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Desktop Table View */}
        <div className="desktop-only">
          <table className="data-table">
            <thead>
              <tr>
                <th>{isAdmin ? 'TÊN CƯ DÂN' : 'THÁNG THU'}</th>
                <th>SỐ PHÒNG</th>
                <th>TỔNG TIỀN</th>
                <th>NGÀY XUẤT</th>
                <th>TRẠNG THÁI</th>
                <th style={{ textAlign: 'center' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? paginatedData.map((item, index) => {
                const isPaid = item.TrangThai === 'Đã thanh toán';
                const colorClass = avatarColors[index % avatarColors.length];
                const initials = getInitials(item.TenCuDan || item.SoPhong || 'HD');
                return (
                  <tr key={item.MaHoaDon}>
                    <td>
                      <div className="table-row-item">
                        <div className={`avatar-initials ${colorClass}`}>{initials}</div>
                        <div className="table-row-info">
                          <h4>{isAdmin ? (item.TenCuDan || `Phòng ${item.SoPhong}`) : `Tháng ${item.ThangThu}`}</h4>
                          {!isAdmin && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mã: #{item.MaHoaDon?.slice(0, 8)}</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{item.SoPhong || 'N/A'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.TongTien ? `${Number(item.TongTien).toLocaleString('vi-VN')} đ` : '0 đ'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {item.NgayTao ? new Date(item.NgayTao).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td>
                      <span className={`badge ${isPaid ? 'badge-success' : item.TrangThai === 'Chờ xác nhận' ? 'badge-warning' : 'badge-danger'}`}>
                        {isPaid ? 'ĐÃ THANH TOÁN' : item.TrangThai === 'Chờ xác nhận' ? 'CHỜ XÁC NHẬN' : 'CHƯA THANH TOÁN'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button className="btn-ghost" title="Xem chi tiết" style={{ fontSize: 16 }} onClick={() => handleViewDetails(item)}>👁️</button>
                        
                        {!isPaid && !isAdmin && item.TrangThai === 'Chưa thanh toán' && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '4px 12px', fontSize: 12 }}
                            onClick={() => openPaymentModal(item)}
                          >Thanh toán</button>
                        )}

                        {isAdmin && item.TrangThai === 'Chờ xác nhận' && (
                          <>
                            <button className="btn-ghost" title="Xác nhận thanh toán" onClick={() => handleXacNhan(item.MaHoaDon)} style={{ color: 'var(--success)', fontSize: 16 }}>✅</button>
                            <button className="btn-ghost" title="Từ chối" onClick={() => handleTuChoi(item.MaHoaDon)} style={{ color: 'var(--danger)', fontSize: 16 }}>❌</button>
                          </>
                        )}

                        {isAdmin && (
                          <>
                            <button className="btn-ghost" title="Tính tiền tự động" onClick={() => handleTinhTien(item.MaHoaDon)}>🧮</button>
                            <button className="btn-ghost" title="Sửa" onClick={() => {
                              setEditingRecord(item);
                              form.setFieldsValue({
                                ...item,
                                HanDongTien: item.HanDongTien ? dayjs(item.HanDongTien) : undefined,
                              });
                              setModalOpen(true);
                            }}>✏️</button>
                            <button className="btn-ghost" title="Xóa" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(item.MaHoaDon)}>🗑️</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    {loading ? 'Đang tải...' : 'Chưa có hóa đơn nào'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-only">
          {paginatedData.length > 0 ? (
            <div className="mobile-list-container">
              {paginatedData.map((item) => (
                <div key={item.key || item.MaHoaDon} style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{item.ThangThu}</h4>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>#{item.MaHoaDon?.slice(0, 8)}</span>
                    </div>
                    <Badge 
                      status={item.TrangThai === 'Đã thanh toán' ? 'success' : 'error'} 
                      text={item.TrangThai.toUpperCase()} 
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>
                      {item.TongTien ? `${Number(item.TongTien).toLocaleString('vi-VN')} đ` : '0 đ'}
                    </div>
                    <Space>
                      <Button size="small" icon={<span>👁️</span>} onClick={() => handleViewDetails(item)}>Chi tiết</Button>
                      {!isAdmin && item.TrangThai === 'Chưa thanh toán' && (
                        <Button type="primary" size="small" onClick={() => openPaymentModal(item)}>Thanh toán</Button>
                      )}
                    </Space>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              {loading ? 'Đang tải...' : 'Chưa có hóa đơn nào'}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE STYLES */}
      <style jsx>{`
        .desktop-only { display: block; }
        .mobile-only { display: none; }
        
        @media (max-width: 768px) {
          .desktop-only { display: none; }
          .mobile-only { display: block; }
          .invoice-container-main { margin: 0 -16px; border-radius: 0; border-left: none; border-right: none; }
        }
      `}</style>

      {/* BOTTOM SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Invoice Summary */}
        {firstInvoice ? (
          <div className="invoice-summary">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>Tóm tắt hóa đơn</h3>
                <span className={`badge ${firstInvoice.TrangThai === 'Đã thanh toán' ? 'badge-success' : firstInvoice.TrangThai === 'Chờ xác nhận' ? 'badge-warning' : 'badge-danger'}`}>
                  {firstInvoice.TrangThai === 'Đã thanh toán' ? 'ĐÃ THANH TOÁN' : firstInvoice.TrangThai === 'Chờ xác nhận' ? 'CHỜ XÁC NHẬN' : 'CHƯA THANH TOÁN'}
                </span>
              </div>
              <div style={{ textAlign: 'right', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                Ngày: {firstInvoice.NgayTao ? new Date(firstInvoice.NgayTao).toLocaleDateString('vi-VN') : '—'}
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
              Mã HĐ: #{firstInvoice.MaHoaDon?.slice(0, 20)}
            </div>
            <div className="label">TỔNG TIỀN PHẢI THANH TOÁN</div>
            <div className="amount">
              {firstInvoice.TongTien ? `${Number(firstInvoice.TongTien).toLocaleString('vi-VN')} đ` : '0 đ'}
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              <span>👤 Phòng {firstInvoice.SoPhong}</span>
              <span>🏢 {firstInvoice.ThangThu}</span>
            </div>
          </div>
        ) : (
          <div className="invoice-summary">
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 12px' }}>Tóm tắt hóa đơn</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Chọn một hóa đơn để xem tóm tắt</p>
          </div>
        )}

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Service banner */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #2d4a6f 100%)',
            borderRadius: 14,
            padding: 20,
            color: 'white',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>{isAdmin ? 'Quản lý tài chính 5 sao' : 'Thanh toán minh bạch'}</h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              {isAdmin ? 'Theo dõi và quản lý dòng tiền toàn hệ thống.' : 'Xem chi tiết các khoản phí và thanh toán trực tuyến nhanh chóng.'}
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="progress-stat-card green">
              <div className="stat-label">{isAdmin ? 'ĐÃ THU TRONG THÁNG' : 'TỶ LỆ THANH TOÁN'}</div>
              <div className="stat-value">{paidPercent}%</div>
              <div className="occupancy-bar" style={{ marginTop: 8 }}>
                <div className="occupancy-bar-fill" style={{ width: `${paidPercent}%` }} />
              </div>
            </div>
            <div className="progress-stat-card">
              <div className="stat-label">{isAdmin ? 'HÓA ĐƠN CHƯA THU' : 'HÓA ĐƠN CẦN ĐÓNG'}</div>
              <div className="stat-value" style={{ color: 'var(--danger)' }}>
                {(isAdmin ? totalUnpaid : (totalUnpaid + totalPending)).toString().padStart(2, '0')}
              </div>
              <div className="stat-sub">{isAdmin ? 'CẦN ĐỐC THÚC' : (totalPending > 0 ? 'ĐANG CHỜ XÁC NHẬN' : 'CẦN THANH TOÁN')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CHI TIẾT DỊCH VỤ */}
      <Modal
        title={`Chi tiết dịch vụ - ${editingRecord?.ThangThu}`}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        <Table
          dataSource={invoiceDetails}
          loading={loadingDetails}
          pagination={false}
          size="small"
          rowKey="MaGhi"
          columns={[
            { title: 'Dịch vụ', dataIndex: 'TenDichVu', key: 'TenDichVu' },
            { 
              title: 'Sử dụng', 
              key: 'suDung',
              render: (_, r) => r.ChiSoHienTai !== null ? `${r.ChiSoHienTai - r.ChiSoLanGhiTruoc}` : (r.SoLuong || 1)
            },
            { title: 'Đơn giá', dataIndex: 'DonGia', key: 'DonGia', render: (v) => `${Number(v).toLocaleString()}đ` },
            { 
              title: 'Thành tiền', 
              key: 'total', 
              render: (_, r) => {
                const qty = r.ChiSoHienTai !== null ? (r.ChiSoHienTai - r.ChiSoLanGhiTruoc) : (r.SoLuong || 1);
                return <span style={{ fontWeight: 600 }}>{Number(qty * r.DonGia).toLocaleString()}đ</span>;
              }
            }
          ]}
        />
      </Modal>

      {/* MODAL */}
      <Modal
        title={editingRecord ? 'Sửa hóa đơn' : 'Tạo hóa đơn mới'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingRecord(null); form.resetFields(); }}
        onOk={() => form.submit()} okText={editingRecord ? 'Cập nhật' : 'Tạo'} cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!editingRecord && (
            <Form.Item name="MaPhong" label="Phòng" rules={[{ required: true, message: 'Chọn phòng' }]}>
              <Select placeholder="Chọn phòng"
                options={phongList.map(p => ({ label: `${p.SoPhong} - ${p.TenToaNha || ''}`, value: p.MaPhong }))} />
            </Form.Item>
          )}
          {!editingRecord && (
            <Form.Item name="ThangThu" label="Tháng thu" rules={[{ required: true, message: 'Nhập tháng thu' }]}>
              <Input placeholder="VD: 01/2026, 03/2026..." />
            </Form.Item>
          )}
          {editingRecord && (
            <Form.Item name="TrangThai" label="Trạng thái">
              <Select options={[
                { label: 'Chưa thanh toán', value: 'Chưa thanh toán' },
                { label: '⏳ Chờ xác nhận', value: 'Chờ xác nhận' },
                { label: 'Đã thanh toán', value: 'Đã thanh toán' },
              ]} />
            </Form.Item>
          )}
          <Form.Item name="HanDongTien" label="Hạn đóng tiền">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày hạn" />
          </Form.Item>
        </Form>
      </Modal>

      {/* PAYMENT MODAL */}
      <PaymentModal
        open={paymentModalVisible}
        onClose={() => { setPaymentModalVisible(false); setSelectedInvoiceForPayment(null); }}
        invoice={selectedInvoiceForPayment}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
}
