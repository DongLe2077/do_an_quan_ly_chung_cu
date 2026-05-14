'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import buildingService from '@/services/buildingService';
import apartmentService from '@/services/apartmentService';
import residentService from '@/services/residentService';
import invoiceService from '@/services/invoiceService';
import incidentService from '@/services/incidentService';
import serviceReadingService from '@/services/serviceReadingService';
import dashboardService from '@/services/dashboardService';
import { Modal, Form, Input, message, Table, Descriptions, Badge } from 'antd';
import PaymentModal from '@/components/PaymentModal';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  if (!user) return null;

  return isAdmin ? <AdminDashboard user={user} /> : <ResidentDashboard user={user} />;
}

// ============================================
// RESIDENT DASHBOARD (Người dùng / Cư dân)
// ============================================
function ResidentDashboard({ user }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cuDanInfo, setCuDanInfo] = useState(null);
  const [hoaDonList, setHoaDonList] = useState([]);
  const [suCoList, setSuCoList] = useState([]);
  const [suCoModalVisible, setSuCoModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchResidentData();
  }, [user]);

  const fetchResidentData = async () => {
    try {
      setLoading(true);
      // 1. Get resident info by user_id
      const cdRes = await residentService.getByUser(user.user_id).catch(() => ({ data: { data: null } }));
      const cdInfo = cdRes.data?.data;
      setCuDanInfo(cdInfo);

      if (cdInfo?.apartment_id) {
        // Fetch invoices for this room
        const hdRes = await invoiceService.getByApartment(cdInfo.apartment_id).catch(() => ({ data: { data: [] } }));
        setHoaDonList(hdRes.data?.data || []);
      }

      // Fetch incidents reported by this user
      const scRes = await incidentService.getByNguoiBao(user.user_id).catch(() => ({ data: { data: [] } }));
      setSuCoList(scRes.data?.data || []);

    } catch (error) {
      console.error('Lỗi tải dữ liệu cư dân:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setPaymentModalVisible(true);
  };

  const handlePaymentConfirm = async (phuongThuc) => {
    await invoiceService.thanhToan(selectedInvoiceForPayment.invoice_id, { PhuongThuc: phuongThuc });
    fetchResidentData();
  };

  const handleViewDetails = async (invoice) => {
    setSelectedInvoice(invoice);
    setDetailModalVisible(true);
    setLoadingDetails(true);
    try {
      const res = await serviceReadingService.getByInvoice(invoice.invoice_id);
      setInvoiceDetails(res.data?.data || []);
    } catch (error) {
      message.error('Không thể tải chi tiết hóa đơn');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSubmitSuCo = async (values) => {
    try {
      await incidentService.create({
        ...values,
        reporter_id: user.user_id,
        apartment_id: cuDanInfo?.apartment_id || null,
      });
      message.success('Đã gửi yêu cầu/sự cố thành công!');
      setSuCoModalVisible(false);
      form.resetFields();
      fetchResidentData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Gửi thất bại');
    }
  };

  const formatCurrency = (val) => {
    return `${Number(val || 0).toLocaleString('vi-VN')} đ`;
  };

  const getSuCoStatusBadge = (status) => {
    if (status === 'Chờ duyệt') return <span className="badge badge-warning">ĐANG CHỜ</span>;
    if (status === 'Đang xử lý') return <span className="badge badge-info">ĐANG XỬ LÝ</span>;
    if (status === 'Đã giải quyết') return <span className="badge badge-success">HOÀN THÀNH</span>;
    return <span className="badge badge-neutral">{status}</span>;
  };

  const unpaidInvoices = hoaDonList.filter(h => h.status === 'Chưa thanh toán');
  const totalUnpaid = unpaidInvoices.reduce((sum, h) => sum + Number(h.total_amount || 0), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Đang tải dữ liệu của bạn...</p>
      </div>
    );
  }

  const initials = (cuDanInfo?.full_name || user?.username || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div>
      {/* WELCOME BANNER */}
      <div className="greeting-banner" style={{ background: 'linear-gradient(135deg, #1a2332 0%, #3a5b88 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 70, height: 70, borderRadius: '50%', background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold'
          }}>
            {initials}
          </div>
          <div>
            <h2>Xin chào, {cuDanInfo?.full_name || user?.username}!</h2>
            <p style={{ fontSize: 16 }}>Căn hộ: <strong style={{ color: 'white' }}>{cuDanInfo?.apartment_number || 'Chưa liên kết'}</strong></p>
          </div>
        </div>
      </div>

      <div className="grid-2-1" style={{ marginTop: 24 }}>
        {/* CỘT TRÁI - HOÁ ĐƠN */}
        <div>
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div>
                <div className="card-title">Hóa đơn của bạn</div>
                <div className="card-subtitle">Chi tiết các khoản phí tháng này</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cần thanh toán</span>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--danger)' }}>{formatCurrency(totalUnpaid)}</div>
              </div>
            </div>

            {hoaDonList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {hoaDonList.map((hd) => (
                  <div key={hd.invoice_id} style={{
                    padding: 16, borderRadius: 12, border: '1px solid var(--border-color)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: hd.status === 'Đã thanh toán' ? '#f8f9fb' : '#fff'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                        background: hd.status === 'Đã thanh toán' ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: hd.status === 'Đã thanh toán' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        📄
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: 15 }}>Hóa đơn phí dịch vụ - {hd.billing_month}</h4>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Hạn: {hd.due_date ? new Date(hd.due_date).toLocaleDateString() : 'N/A'}</span>
                          {hd.status === 'Đã thanh toán' 
                            ? <span className="badge badge-success">Đã thanh toán</span>
                            : hd.status === 'Chờ xác nhận'
                            ? <span className="badge badge-warning">Chờ xác nhận</span>
                            : <span className="badge badge-danger">Chưa thanh toán</span>
                          }
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{formatCurrency(hd.total_amount)}</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-ghost" onClick={() => handleViewDetails(hd)} style={{ padding: '4px 8px', fontSize: 12, border: '1px solid var(--border-color)', borderRadius: 6 }}>
                          Chi tiết
                        </button>
                        {hd.status === 'Chưa thanh toán' && (
                          <button className="btn btn-primary" onClick={() => openPaymentModal(hd)} style={{ padding: '6px 16px', fontSize: 12 }}>
                            Thanh toán
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, border: '1px dashed var(--border-color)', borderRadius: 12 }}>
                <span style={{ fontSize: 40 }}>🎉</span>
                <h4 style={{ margin: '12px 0 4px', color: 'var(--text-primary)' }}>Không có hóa đơn</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Bạn đã thanh toán tất cả hóa đơn hiện tại.</p>
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI - SỰ CỐ & Hỗ trợ */}
        <div>
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <div>
                <div className="card-title">Yêu cầu & Sự cố</div>
                <div className="card-subtitle">Theo dõi trạng thái yêu cầu của bạn</div>
              </div>
              <button className="btn btn-primary" onClick={() => setSuCoModalVisible(true)} style={{ background: '#34c759', borderColor: '#34c759' }}>
                + Gửi yêu cầu
              </button>
            </div>

            {suCoList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {suCoList.map(sc => (
                  <div key={sc.incident_id} style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    <div className="flex-between">
                      <h4 style={{ margin: '0 0 4px', fontSize: 14 }}>{sc.title}</h4>
                      {getSuCoStatusBadge(sc.status)}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {sc.description}
                    </p>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Gửi lúc: {new Date(sc.report_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 30, background: '#f8f9fb', borderRadius: 12 }}>
                <span style={{ fontSize: 32 }}>🛠️</span>
                <p style={{ color: 'var(--text-muted)', margin: '8px 0 0', fontSize: 13 }}>Chưa có yêu cầu/sự cố nào được gửi.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal chi tiết hóa đơn */}
      <Modal
        title={`Chi tiết hóa đơn - ${selectedInvoice?.billing_month}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedInvoice && (
          <div>
            <div style={{ marginBottom: 20, padding: 16, background: '#f8f9fb', borderRadius: 8 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Mã hóa đơn">{selectedInvoice.invoice_id}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Badge status={selectedInvoice.status === 'Đã thanh toán' ? 'success' : 'error'} text={selectedInvoice.status} />
                </Descriptions.Item>
                <Descriptions.Item label="Hạn thanh toán">{selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString() : 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Tổng cộng"><span style={{ fontWeight: 'bold', color: 'var(--danger)', fontSize: 16 }}>{formatCurrency(selectedInvoice.total_amount)}</span></Descriptions.Item>
              </Descriptions>
            </div>
            
            <h4 style={{ marginBottom: 12 }}>Danh sách dịch vụ</h4>
            <Table
              dataSource={invoiceDetails}
              loading={loadingDetails}
              pagination={false}
              size="small"
              rowKey="reading_id"
              columns={[
                { title: 'Dịch vụ', dataIndex: 'service_name', key: 'service_name' },
                { 
                  title: 'Chỉ số', 
                  key: 'chiSo',
                  render: (_, record) => record.current_reading !== null ? `${record.current_reading} - ${record.previous_reading}` : '-'
                },
                { 
                  title: 'Số lượng / Sử dụng', 
                  key: 'suDung',
                  render: (_, record) => {
                    if (record.current_reading !== null) return record.current_reading - record.previous_reading;
                    return record.quantity || 1;
                  }
                },
                { title: 'Đơn giá', dataIndex: 'unit_price', key: 'unit_price', render: (val) => formatCurrency(val) },
                { 
                  title: 'Thành tiền', 
                  key: 'thanhTien',
                  render: (_, record) => {
                    let total = 0;
                    if (record.current_reading !== null) total = (record.current_reading - record.previous_reading) * record.unit_price;
                    else total = (record.quantity || 1) * record.unit_price;
                    return <span style={{ fontWeight: 600 }}>{formatCurrency(total)}</span>;
                  }
                }
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Modal gửi sự cố */}
      <Modal
        title="Gửi yêu cầu / Báo cáo sự cố"
        open={suCoModalVisible}
        onCancel={() => { setSuCoModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitSuCo}>
          <Form.Item name="title" label="Tên sự cố / Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
            <Input placeholder="Ví dụ: Rò rỉ nước nhà tắm" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả chi tiết" rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết' }]}>
            <Input.TextArea rows={4} placeholder="Mô tả chi tiết hiện trạng..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thanh toán */}
      <PaymentModal
        open={paymentModalVisible}
        onClose={() => { setPaymentModalVisible(false); setSelectedInvoiceForPayment(null); }}
        invoice={selectedInvoiceForPayment}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
}


// ============================================
// ADMIN DASHBOARD
// ============================================
function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    toaNha: 0, phong: 0, cuDan: 0, doanhThu: 0, suCoPending: 0
  });
  const [recentSuCo, setRecentSuCo] = useState([]);
  const [recentCuDan, setRecentCuDan] = useState([]);
  const [invoiceStats, setInvoiceStats] = useState([]);

  const toNumber = (val) => Number(val || 0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await dashboardService.getStats();
      const data = res.data?.data;
      if (!data) return;

      setStats({
        toaNha: toNumber(data.totalBuildings),
        phong: toNumber(data.totalApartments),
        cuDan: toNumber(data.totalResidents),
        doanhThu: toNumber(data.totalRevenue),
        suCoPending: toNumber(data.pendingIncidents),
      });

      setRecentSuCo(data.recentIncidents || []);
      setRecentCuDan(data.recentResidents || []);

      setInvoiceStats([
        { name: 'Đã nộp', value: toNumber(data.invoiceStats?.paid), color: '#34c759' }, // var(--success)
        { name: 'Chưa nộp', value: toNumber(data.invoiceStats?.unpaid), color: '#ff3b30' } // var(--danger)
      ]);

    } catch (error) {
      console.error('Lỗi tải dữ liệu dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B đ`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M đ`;
    return `${num.toLocaleString('vi-VN')} đ`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const getSuCoStatusBadge = (status) => {
    if (status === 'Chờ duyệt') return <span className="badge badge-danger">KHẨN CẤP</span>;
    if (status === 'Đang xử lý') return <span className="badge badge-warning">ĐANG CHỜ</span>;
    return <span className="badge badge-info">LÊN LỊCH</span>;
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 60) return `${diff} phút trước`;
    if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
    return `${Math.floor(diff / 1440)} ngày trước`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        {/* Skeleton Loading */}
        <div className="page-fade-in">
          {/* Skeleton Banner */}
          <div className="skeleton skeleton-rect" style={{ height: 120, marginBottom: 24 }} />

          {/* Skeleton Stat Cards */}
          <div className="stats-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 24 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-stat-card">
                <div className="skeleton skeleton-circle" style={{ width: 32, height: 32, marginBottom: 12 }} />
                <div className="skeleton skeleton-line short" />
                <div className="skeleton skeleton-line" style={{ width: '60%', height: 28 }} />
              </div>
            ))}
          </div>

          {/* Skeleton Chart */}
          <div className="skeleton-card" style={{ marginBottom: 24 }}>
            <div className="skeleton skeleton-line title" />
            <div className="skeleton skeleton-line short" style={{ marginBottom: 24 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
              <div className="skeleton skeleton-circle" style={{ width: 160, height: 160, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-line long" style={{ height: 48, marginBottom: 20 }} />
                <div className="skeleton skeleton-line long" style={{ height: 48 }} />
              </div>
            </div>
          </div>

          {/* Skeleton Bottom Row */}
          <div className="grid-2">
            <div className="skeleton-card">
              <div className="skeleton skeleton-line title" />
              <div className="skeleton skeleton-line long" />
              <div className="skeleton skeleton-line medium" />
              <div className="skeleton skeleton-line long" />
            </div>
            <div className="skeleton-card">
              <div className="skeleton skeleton-line title" />
              <div className="skeleton skeleton-line long" />
              <div className="skeleton skeleton-line medium" />
              <div className="skeleton skeleton-line long" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-fade-in">
      {/* GREETING BANNER */}
      <div className="greeting-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34c759', boxShadow: '0 0 8px #34c759' }}></div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Hệ thống hoạt động bình thường</span>
        </div>
        <h2>{getGreeting()}, Admin! 👋</h2>
        <p>Hệ thống ghi nhận <strong style={{ color: '#ffd60a' }}>{stats.suCoPending}</strong> sự cố cần xử lý trong ngày hôm nay.</p>
      </div>

      {/* STATS ROW */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="stat-card" onClick={() => router.push('/buildings')}>
          <div className="stat-card-icon">🏢</div>
          <div className="stat-card-label">TÒA NHÀ</div>
          <div className="stat-card-value">{stats.toaNha.toString().padStart(2, '0')}</div>
        </div>
        <div className="stat-card" onClick={() => router.push('/apartments')}>
          <div className="stat-card-icon">🏠</div>
          <div className="stat-card-label">CĂN HỘ</div>
          <div className="stat-card-value">{stats.phong.toLocaleString()}</div>
        </div>
        <div className="stat-card" onClick={() => router.push('/residents')}>
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-label">CƯ DÂN</div>
          <div className="stat-card-value">{stats.cuDan.toLocaleString()}</div>
        </div>
        <div className="stat-card" onClick={() => router.push('/invoices')}>
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-label">TỔNG THU PHÍ</div>
          <div className="stat-card-value">{formatCurrency(stats.doanhThu)}</div>
        </div>
        <div className="stat-card highlight" onClick={() => router.push('/incidents')}>
          <div className="stat-card-icon">⚠️</div>
          <div className="stat-card-label" style={{ color: 'var(--danger)' }}>SỰ CỐ CHỜ</div>
          <div className="stat-card-value" style={{ color: 'var(--danger)' }}>
            {stats.suCoPending.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* INVOICE STATS CHART */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="card-title">Thống kê thanh toán hóa đơn</div>
            <div className="card-subtitle">Tổng quan tình trạng thu phí</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {invoiceStats.map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: i === 0 ? 'var(--success-bg)' : 'var(--danger-bg)', borderRadius: 20, fontSize: 12, fontWeight: 600, color: i === 0 ? 'var(--success)' : 'var(--danger)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: stat.color }}></div>
                {stat.name}
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginTop: 24 }}>
          {/* Donut Chart */}
          <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
            {(() => {
              const total = invoiceStats.reduce((a, b) => a + b.value, 0) || 1;
              const paidPct = (invoiceStats[0]?.value || 0) / total * 100;
              const circumference = 2 * Math.PI * 70;
              const paidArc = (paidPct / 100) * circumference;
              return (
                <svg width="180" height="180" viewBox="0 0 180 180">
                  {/* Background ring */}
                  <circle cx="90" cy="90" r="70" fill="none" stroke="#ffe5e3" strokeWidth="20" />
                  {/* Paid arc */}
                  <circle cx="90" cy="90" r="70" fill="none" stroke="#34c759" strokeWidth="20"
                    strokeDasharray={`${paidArc} ${circumference}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.8s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                  />
                  {/* Center text */}
                  <text x="90" y="82" textAnchor="middle" style={{ fontSize: 32, fontWeight: 800, fill: 'var(--text-primary)' }}>
                    {Math.round(paidPct)}%
                  </text>
                  <text x="90" y="104" textAnchor="middle" style={{ fontSize: 12, fill: 'var(--text-muted)', fontWeight: 500 }}>
                    Đã nộp
                  </text>
                </svg>
              );
            })()}
          </div>

          {/* Column Bars */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {invoiceStats.map((stat, i) => {
              const total = invoiceStats.reduce((a, b) => a + b.value, 0) || 1;
              const pct = Math.round((stat.value / total) * 100);
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ 
                        width: 40, height: 40, borderRadius: 12,
                        background: i === 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18
                      }}>
                        {i === 0 ? '✅' : '⏳'}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{stat.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.value} hóa đơn</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{pct}%</div>
                  </div>
                  <div style={{ height: 10, background: '#f0f2f7', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: i === 0 
                        ? 'linear-gradient(90deg, #34c759, #2ac3a2)' 
                        : 'linear-gradient(90deg, #ff3b30, #ff6b6b)',
                      borderRadius: 5,
                      transition: 'width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid-2">
        {/* SỰ CỐ MỚI NHẤT */}
        <div className="card">
          <div className="card-title">Sự cố mới nhất</div>
          <div style={{ marginTop: 16 }}>
            {recentSuCo.length > 0 ? recentSuCo.map((sc, i) => (
              <div className="incident-item" key={i}>
                <div className="incident-info">
                  <h4>{sc.title || `Sự cố #${i + 1}`}</h4>
                  <span>{sc.apartment_number ? `Phòng ${sc.apartment_number}` : 'Chưa xác định'} • {getTimeAgo(sc.report_date)}</span>
                </div>
                {getSuCoStatusBadge(sc.status)}
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '30px 20px', background: '#f8f9fb', borderRadius: 12 }}>
                <span style={{ fontSize: 36 }}>✅</span>
                <h4 style={{ margin: '10px 0 4px', color: 'var(--text-primary)', fontSize: 14 }}>Không có sự cố</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 13 }}>Hệ thống đang hoạt động ổn định.</p>
              </div>
            )}
          </div>
        </div>

        {/* CƯ DÂN MỚI */}
        <div className="card">
          <div className="card-title">Cư dân mới</div>
          <div style={{ marginTop: 16 }}>
            {recentCuDan.length > 0 ? recentCuDan.map((cd, i) => {
              const colors = ['avatar-blue', 'avatar-purple', 'avatar-teal'];
              const statusTexts = ['Đã xác minh', 'Chờ duyệt', 'Đã xác minh'];
              const initials = (cd.full_name || 'CD').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div className="resident-item" key={i}>
                  <div className="resident-item-left">
                    <div className={`avatar-initials ${colors[i % colors.length]}`}>{initials}</div>
                    <div className="resident-item-info">
                      <h4>{cd.full_name || 'Cư dân'}</h4>
                      <span>Căn hộ {cd.apartment_number || 'N/A'}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: i === 1 ? 'var(--warning)' : 'var(--text-muted)' }}>
                    {statusTexts[i % statusTexts.length]}
                  </span>
                </div>
              );
            }) : (
              <div style={{ textAlign: 'center', padding: '30px 20px', background: '#f8f9fb', borderRadius: 12 }}>
                <span style={{ fontSize: 36 }}>👥</span>
                <h4 style={{ margin: '10px 0 4px', color: 'var(--text-primary)', fontSize: 14 }}>Chưa có cư dân</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 13 }}>Hãy thêm cư dân mới vào hệ thống.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
