'use client';

import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import apartmentService from '@/services/apartmentService';
import buildingService from '@/services/buildingService';

export default function PhongPage() {
  const [data, setData] = useState([]);
  const [toaNhaList, setToaNhaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filterToaNha, setFilterToaNha] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => { fetchData(); fetchToaNha(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apartmentService.getAll();
      setData(res.data?.data || []);
    } catch { message.error('Lỗi tải danh sách phòng'); }
    finally { setLoading(false); }
  };

  const fetchToaNha = async () => {
    try {
      const res = await buildingService.getAll();
      setToaNhaList(res.data?.data || []);
    } catch {}
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await apartmentService.update(editingRecord.apartment_id, values);
        message.success('Cập nhật căn hộ thành công');
      } else {
        await apartmentService.create(values);
        message.success('Thêm căn hộ thành công');
      }
      setModalOpen(false); form.resetFields(); setEditingRecord(null);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (apartmentId) => {
    if (!confirm('Xác nhận xóa căn hộ này?')) return;
    try {
      await apartmentService.delete(apartmentId);
      message.success('Xóa căn hộ thành công');
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Xóa thất bại'); }
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const openDetail = async (apartmentId) => {
    try {
      const res = await apartmentService.getById(apartmentId);
      setDetailData(res.data?.data);
      setDetailModalOpen(true);
    } catch {
      message.error('Lỗi tải chi tiết căn hộ');
    }
  };

  const openCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const applyFilters = () => {
    setCurrentPage(1);
  };

  let filteredData = data;
  if (filterToaNha) filteredData = filteredData.filter(p => p.building_id === filterToaNha);
  if (filterTrangThai) filteredData = filteredData.filter(p => p.status === filterTrangThai);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadge = (status) => {
    if (status === 'Đang sử dụng') return <span className="badge badge-dark">ĐANG SỬ DỤNG</span>;
    if (status === 'Trống') return <span className="badge badge-success">PHÒNG TRỐNG</span>;
    return <span className="badge badge-warning">BẢO TRÌ</span>;
  };

  const getToaNhaName = (buildingId) => {
    const tn = toaNhaList.find(t => t.building_id === buildingId);
    return tn?.building_name || 'N/A';
  };

  const getRoomType = (area) => {
    if (!area) return 'Studio';
    if (area >= 100) return 'Căn hộ VIP';
    if (area >= 70) return 'Căn hộ 3PN';
    if (area >= 50) return 'Căn hộ 2PN';
    return 'Studio';
  };

  // Skeleton Loading Component
  const SkeletonCard = () => (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20, boxShadow: 'var(--card-shadow)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="skeleton" style={{ width: 80, height: 22 }} />
        <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 12 }} />
      </div>
      <div className="skeleton skeleton-line medium" />
      <div className="skeleton skeleton-line short" />
      <div className="skeleton skeleton-line medium" />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        <div className="skeleton" style={{ width: 50, height: 30, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 70, height: 30, borderRadius: 8 }} />
      </div>
    </div>
  );

  return (
    <div className="page-fade-in">
      {/* PAGE HEADER */}
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Quản lý Căn hộ</h1>
          <p>Danh sách các căn hộ trong hệ thống vận hành.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <span>+</span> Thêm căn hộ
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <select
          className="filter-select"
          value={filterTrangThai}
          onChange={(e) => setFilterTrangThai(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Trống">Phòng trống</option>
          <option value="Đang sử dụng">Đang sử dụng</option>
          <option value="Bảo trì">Đang bảo trì</option>
        </select>

        <select
          className="filter-select"
          value={filterToaNha}
          onChange={(e) => setFilterToaNha(e.target.value)}
        >
          <option value="">Tất cả tòa nhà</option>
          {toaNhaList.map(t => (
            <option key={t.building_id} value={t.building_id}>{t.building_name}</option>
          ))}
        </select>

        <button className="btn btn-outline" onClick={applyFilters}>Áp dụng</button>
      </div>

      {/* APARTMENT CARDS GRID */}
      <div className="apartment-grid">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : paginatedData.length > 0 ? paginatedData.map((item) => (
          <div className="apartment-card" key={item.apartment_id}>
            <div className="apartment-card-header">
              <span className="apartment-card-id">{item.apartment_number}</span>
              {getStatusBadge(item.status)}
            </div>

            <div className="apartment-card-info">
              <div className="apartment-card-info-row">
                <span className="label">Tòa nhà:</span>
                <span className="value">{getToaNhaName(item.building_id)}</span>
              </div>
              <div className="apartment-card-info-row">
                <span className="label">Loại:</span>
                <span className="value">{getRoomType(item.area)}</span>
              </div>
              {item.area && (
                <div className="apartment-card-info-row">
                  <span className="label">Diện tích:</span>
                  <span className="value">{item.area} m²</span>
                </div>
              )}
            </div>

            <div className="apartment-card-actions">
              <button className="btn btn-ghost" onClick={() => openEdit(item)}>Sửa</button>
              <button className="btn btn-dark" onClick={() => openDetail(item.apartment_id)}>Chi tiết</button>
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            Chưa có căn hộ nào
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {filteredData.length > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Hiển thị {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} - {Math.min(currentPage * pageSize, filteredData.length)} trong {filteredData.length.toLocaleString()} căn hộ
          </div>
          <div className="pagination-buttons">
            <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <button
                key={i + 1}
                className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >{i + 1}</button>
            ))}
            <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</button>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      <Modal
        title={editingRecord ? 'Sửa căn hộ' : 'Thêm căn hộ mới'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingRecord(null); form.resetFields(); }}
        onOk={() => form.submit()}
        okText={editingRecord ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="apartment_number" label="Số phòng" rules={[{ required: true, message: 'Vui lòng nhập số phòng' }]}>
            <Input placeholder="VD: A-2405, B-1202..." />
          </Form.Item>
          <Form.Item name="building_id" label="Tòa nhà" rules={[{ required: true, message: 'Vui lòng chọn tòa nhà' }]}>
            <Select placeholder="Chọn tòa nhà" options={toaNhaList.map(t => ({ label: t.building_name, value: t.building_id }))} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue="Hoạt động">
            <Select options={[
              { label: 'Hoạt động (Tự động theo cư dân)', value: 'Hoạt động' },
              { label: 'Bảo trì', value: 'Bảo trì' },
            ]} />
          </Form.Item>
          <Form.Item name="area" label="Diện tích (m²)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập diện tích" />
          </Form.Item>
        </Form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        title={`Chi tiết căn hộ ${detailData?.apartment_number}`}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <button key="close" className="btn btn-dark" onClick={() => setDetailModalOpen(false)}>Đóng</button>
        ]}
        width={600}
      >
        {detailData && (
          <div className="detail-container">
            <div className="detail-section">
              <h4 style={{ marginBottom: 12, color: 'var(--primary-color)' }}>Thông tin chung</h4>
              <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)' }}>Tòa nhà</label>
                  <div style={{ fontWeight: 500 }}>{detailData.building_name}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)' }}>Số phòng</label>
                  <div style={{ fontWeight: 500 }}>{detailData.apartment_number}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)' }}>Loại căn hộ</label>
                  <div style={{ fontWeight: 500 }}>{getRoomType(detailData.area)}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)' }}>Diện tích</label>
                  <div style={{ fontWeight: 500 }}>{detailData.area} m²</div>
                </div>
              </div>
            </div>

            <div className="detail-section" style={{ marginTop: 24 }}>
              <h4 style={{ marginBottom: 12, color: 'var(--primary-color)' }}>Danh sách cư dân ({detailData.DanhSachCuDan?.length || 0})</h4>
              {detailData.DanhSachCuDan?.length > 0 ? (
                <div style={{ background: '#f8f9fa', borderRadius: 8, padding: 8 }}>
                  {detailData.DanhSachCuDan.map((resident, idx) => (
                    <div key={resident.resident_id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '10px 12px',
                      borderBottom: idx === detailData.DanhSachCuDan.length - 1 ? 'none' : '1px solid #eee'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{resident.full_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>SĐT: {resident.phone || 'N/A'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>CCCD: {resident.id_card || 'N/A'}</div>
                        <div style={{ fontSize: 11, fontStyle: 'italic' }}>{resident.hometown}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', border: '1px dashed #ddd', borderRadius: 8 }}>
                  Chưa có cư dân đăng ký ở căn hộ này.
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
