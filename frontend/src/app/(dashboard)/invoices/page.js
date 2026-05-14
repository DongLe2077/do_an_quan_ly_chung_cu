'use client';

import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, message, Table, Card, Badge, Button, Space } from 'antd';
import invoiceService from '@/services/invoiceService';
import apartmentService from '@/services/apartmentService';
import residentService from '@/services/residentService';
import serviceReadingService from '@/services/serviceReadingService';
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
  const [searchText, setSearchText] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;
  const [form] = Form.useForm();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
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
  }, [user, currentPage, searchText, filterTrangThai]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await invoiceService.getAll({ 
        page: currentPage, limit: pageSize, search: searchText, status: filterTrangThai 
      });
      if (res.data?.pagination) {
        setData(res.data.data || []);
        setTotalItems(res.data.pagination.total);
      } else {
        setData(res.data?.data || []);
        setTotalItems((res.data?.data || []).length);
      }
    } catch { message.error('Lỗi tải danh sách hóa đơn'); }
    finally { setLoading(false); }
  };

  const fetchResidentData = async () => {
    setLoading(true);
    try {
      const cdRes = await residentService.getByUser(user.user_id);
      const cd = cdRes.data?.data;
      setCuDanInfo(cd);
      if (cd?.apartment_id) {
        const res = await invoiceService.getByApartment(cd.apartment_id);
        setData(res.data?.data || []);
      }
    } catch { message.error('Lỗi tải dữ liệu cư dân'); }
    finally { setLoading(false); }
  };

  const fetchPhong = async () => {
    try { const res = await apartmentService.getAll(); setPhongList(res.data?.data || []); } catch {}
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        HanDongTien: values.due_date ? values.due_date.format('YYYY-MM-DD') : undefined,
      };
      if (editingRecord) {
        await invoiceService.update(editingRecord.invoice_id, payload);
        message.success('Cập nhật hóa đơn thành công');
      } else {
        await invoiceService.create(payload);
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
    await invoiceService.thanhToan(selectedInvoiceForPayment.invoice_id, { PhuongThuc: phuongThuc });
    if (isAdmin) fetchData(); else fetchResidentData();
  };

  const handleXacNhan = async (invoiceId) => {
    try {
      await invoiceService.xacNhanThanhToan(invoiceId);
      message.success('Đã xác nhận thanh toán thành công');
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Xác nhận thất bại'); }
  };

  const handleTuChoi = async (invoiceId) => {
    if (!confirm('Xác nhận từ chối thanh toán này? Hóa đơn sẽ trở về trạng thái chưa thanh toán.')) return;
    try {
      await invoiceService.tuChoiThanhToan(invoiceId);
      message.warning('Đã từ chối thanh toán');
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Từ chối thất bại'); }
  };

  const handleTinhTien = async (invoiceId) => {
    try {
      const res = await invoiceService.tinhTienTuDong(invoiceId);
      message.success(`Tính tiền thành công! Tổng: ${Number(res.data?.data?.total_amount || 0).toLocaleString('vi-VN')} đ`);
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Tính tiền thất bại'); }
  };

  const handleViewDetails = async (record) => {
    setEditingRecord(record);
    setDetailModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await serviceReadingService.getByInvoice(record.invoice_id);
      setInvoiceDetails(res.data?.data || []);
    } catch { message.error('Lỗi tải chi tiết dịch vụ'); }
    finally { setLoadingDetails(false); }
  };

  const handleDelete = async (invoiceId) => {
    if (!confirm('Xác nhận xóa hóa đơn này?')) return;
    try {
      await invoiceService.delete(invoiceId);
      message.success('Xóa hóa đơn thành công');
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Xóa thất bại'); }
  };

  let filteredData = data;
  if (filterMonth) filteredData = filteredData.filter(h => h.billing_month?.includes(filterMonth));

  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedData = filteredData;

  const totalPaid = data.filter(h => h.status === 'Đã thanh toán').length;
  const totalPending = data.filter(h => h.status === 'Chờ xác nhận').length;
  const totalUnpaid = data.filter(h => h.status === 'Chưa thanh toán').length;
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
          <p>{isAdmin ? 'Quản lý các khoản phí định kỳ cho cư dân.' : `Chào ${cuDanInfo?.full_name || 'bạn'}, đây là danh sách hóa đơn phòng ${cuDanInfo?.apartment_number || ''}.`}</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        {isAdmin && (
          <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 300 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
            <input
              type="text"
              className="form-input"
              placeholder="Tìm theo phòng..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setSearchText(searchInput);
                  setCurrentPage(1);
                }
              }}
              style={{ paddingLeft: 36, width: '100%', border: 'none', background: 'transparent' }}
            />
          </div>
        )}
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
              Cư dân: {cuDanInfo?.full_name}
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
                const isPaid = item.status === 'Đã thanh toán';
                const colorClass = avatarColors[index % avatarColors.length];
                const initials = getInitials(item.TenCuDan || item.apartment_number || 'HD');
                return (
                  <tr key={item.invoice_id}>
                    <td>
                      <div className="table-row-item">
                        <div className={`avatar-initials ${colorClass}`}>{initials}</div>
                        <div className="table-row-info">
                          <h4>{isAdmin ? (item.TenCuDan || `Phòng ${item.apartment_number}`) : `Tháng ${item.billing_month}`}</h4>
                          {!isAdmin && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mã: #{item.invoice_id?.slice(0, 8)}</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{item.apartment_number || 'N/A'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.total_amount ? `${Number(item.total_amount).toLocaleString('vi-VN')} đ` : '0 đ'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td>
                      <span className={`badge ${isPaid ? 'badge-success' : item.status === 'Chờ xác nhận' ? 'badge-warning' : 'badge-danger'}`}>
                        {isPaid ? 'ĐÃ THANH TOÁN' : item.status === 'Chờ xác nhận' ? 'CHỜ XÁC NHẬN' : 'CHƯA THANH TOÁN'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button className="btn-ghost" title="Xem chi tiết" style={{ fontSize: 16 }} onClick={() => handleViewDetails(item)}>👁️</button>
                        
                        {!isPaid && !isAdmin && item.status === 'Chưa thanh toán' && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '4px 12px', fontSize: 12 }}
                            onClick={() => openPaymentModal(item)}
                          >Thanh toán</button>
                        )}

                        {isAdmin && item.status === 'Chờ xác nhận' && (
                          <>
                            <button className="btn-ghost" title="Xác nhận thanh toán" onClick={() => handleXacNhan(item.invoice_id)} style={{ color: 'var(--success)', fontSize: 16 }}>✅</button>
                            <button className="btn-ghost" title="Từ chối" onClick={() => handleTuChoi(item.invoice_id)} style={{ color: 'var(--danger)', fontSize: 16 }}>❌</button>
                          </>
                        )}

                        {isAdmin && (
                          <>
                            <button className="btn-ghost" title="Tính tiền tự động" onClick={() => handleTinhTien(item.invoice_id)}>🧮</button>
                            <button className="btn-ghost" title="Sửa" onClick={() => {
                              setEditingRecord(item);
                              form.setFieldsValue({
                                ...item,
                                HanDongTien: item.due_date ? dayjs(item.due_date) : undefined,
                              });
                              setModalOpen(true);
                            }}>✏️</button>
                            <button className="btn-ghost" title="Xóa" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(item.invoice_id)}>🗑️</button>
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
                <div key={item.key || item.invoice_id} style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{item.billing_month}</h4>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>#{item.invoice_id?.slice(0, 8)}</span>
                    </div>
                    <Badge 
                      status={item.status === 'Đã thanh toán' ? 'success' : 'error'} 
                      text={item.status.toUpperCase()} 
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>
                      {item.total_amount ? `${Number(item.total_amount).toLocaleString('vi-VN')} đ` : '0 đ'}
                    </div>
                    <Space>
                      <Button size="small" icon={<span>👁️</span>} onClick={() => handleViewDetails(item)}>Chi tiết</Button>
                      {!isAdmin && item.status === 'Chưa thanh toán' && (
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
                <span className={`badge ${firstInvoice.status === 'Đã thanh toán' ? 'badge-success' : firstInvoice.status === 'Chờ xác nhận' ? 'badge-warning' : 'badge-danger'}`}>
                  {firstInvoice.status === 'Đã thanh toán' ? 'ĐÃ THANH TOÁN' : firstInvoice.status === 'Chờ xác nhận' ? 'CHỜ XÁC NHẬN' : 'CHƯA THANH TOÁN'}
                </span>
              </div>
              <div style={{ textAlign: 'right', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                Ngày: {firstInvoice.created_at ? new Date(firstInvoice.created_at).toLocaleDateString('vi-VN') : '—'}
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>
              Mã HĐ: #{firstInvoice.invoice_id?.slice(0, 20)}
            </div>
            <div className="label">TỔNG TIỀN PHẢI THANH TOÁN</div>
            <div className="amount">
              {firstInvoice.total_amount ? `${Number(firstInvoice.total_amount).toLocaleString('vi-VN')} đ` : '0 đ'}
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              <span>👤 Phòng {firstInvoice.apartment_number}</span>
              <span>🏢 {firstInvoice.billing_month}</span>
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
        title={`Chi tiết dịch vụ - ${editingRecord?.billing_month}`}
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
          rowKey="reading_id"
          columns={[
            { title: 'Tên dịch vụ', dataIndex: 'service_name', key: 'service_name' },
            { 
              title: 'Sử dụng', 
              key: 'suDung',
              render: (_, r) => r.current_reading !== null ? `${r.current_reading - r.previous_reading}` : (r.quantity || 1)
            },
            { title: 'Đơn giá', dataIndex: 'unit_price', key: 'unit_price', render: (v) => `${Number(v).toLocaleString()}đ` },
            { title: 'Chỉ số cũ', dataIndex: 'previous_reading', key: 'previous_reading', render: (v) => v != null ? v : '-' },
            { 
              title: 'Thành tiền', 
              key: 'total', 
              render: (_, r) => {
                const qty = r.current_reading !== null ? (r.current_reading - r.previous_reading) : (r.quantity || 1);
                return <span style={{ fontWeight: 600 }}>{Number(qty * r.unit_price).toLocaleString()}đ</span>;
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
            <Form.Item name="apartment_id" label="Phòng" rules={[{ required: true, message: 'Chọn phòng' }]}>
              <Select placeholder="Chọn phòng"
                options={phongList.map(p => ({ label: `${p.apartment_number} - ${p.building_name || ''}`, value: p.apartment_id }))} />
            </Form.Item>
          )}
          {!editingRecord && (
            <Form.Item name="billing_month" label="Tháng thu" rules={[{ required: true, message: 'Nhập tháng thu' }]}>
              <Input placeholder="VD: 01/2026, 03/2026..." />
            </Form.Item>
          )}
          {editingRecord && (
            <Form.Item name="status" label="Trạng thái">
              <Select options={[
                { label: 'Chưa thanh toán', value: 'Chưa thanh toán' },
                { label: '⏳ Chờ xác nhận', value: 'Chờ xác nhận' },
                { label: 'Đã thanh toán', value: 'Đã thanh toán' },
              ]} />
            </Form.Item>
          )}
          <Form.Item name="due_date" label="Hạn đóng tiền">
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
