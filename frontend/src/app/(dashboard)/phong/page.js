'use client';

import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import phongService from '@/services/phongService';
import toaNhaService from '@/services/toaNhaService';

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
  const [form] = Form.useForm();

  useEffect(() => { fetchData(); fetchToaNha(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await phongService.getAll();
      setData(res.data?.data || []);
    } catch { message.error('Lỗi tải danh sách phòng'); }
    finally { setLoading(false); }
  };

  const fetchToaNha = async () => {
    try {
      const res = await toaNhaService.getAll();
      setToaNhaList(res.data?.data || []);
    } catch {}
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await phongService.update(editingRecord.MaPhong, values);
        message.success('Cập nhật căn hộ thành công');
      } else {
        await phongService.create(values);
        message.success('Thêm căn hộ thành công');
      }
      setModalOpen(false); form.resetFields(); setEditingRecord(null);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (MaPhong) => {
    if (!confirm('Xác nhận xóa căn hộ này?')) return;
    try {
      await phongService.delete(MaPhong);
      message.success('Xóa căn hộ thành công');
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Xóa thất bại'); }
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalOpen(true);
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
  if (filterToaNha) filteredData = filteredData.filter(p => p.MaToaNha === filterToaNha);
  if (filterTrangThai) filteredData = filteredData.filter(p => p.TrangThai === filterTrangThai);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadge = (status) => {
    if (status === 'Đang sử dụng') return <span className="badge badge-dark">ĐANG SỬ DỤNG</span>;
    if (status === 'Trống') return <span className="badge badge-success">PHÒNG TRỐNG</span>;
    return <span className="badge badge-warning">BẢO TRÌ</span>;
  };

  const getToaNhaName = (maToaNha) => {
    const tn = toaNhaList.find(t => t.MaToaNha === maToaNha);
    return tn?.TenToaNha || 'N/A';
  };

  const getRoomType = (dienTich) => {
    if (!dienTich) return 'Studio';
    if (dienTich >= 100) return 'Penthouse';
    if (dienTich >= 70) return 'Căn hộ 3PN';
    if (dienTich >= 50) return 'Căn hộ 2PN';
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
            <option key={t.MaToaNha} value={t.MaToaNha}>{t.TenToaNha}</option>
          ))}
        </select>

        <button className="btn btn-outline" onClick={applyFilters}>Áp dụng</button>
      </div>

      {/* APARTMENT CARDS GRID */}
      <div className="apartment-grid">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : paginatedData.length > 0 ? paginatedData.map((item) => (
          <div className="apartment-card" key={item.MaPhong}>
            <div className="apartment-card-header">
              <span className="apartment-card-id">{item.SoPhong}</span>
              {getStatusBadge(item.TrangThai)}
            </div>

            <div className="apartment-card-info">
              <div className="apartment-card-info-row">
                <span className="label">Tòa nhà:</span>
                <span className="value">{getToaNhaName(item.MaToaNha)}</span>
              </div>
              <div className="apartment-card-info-row">
                <span className="label">Loại:</span>
                <span className="value">{getRoomType(item.DienTich)}</span>
              </div>
              {item.DienTich && (
                <div className="apartment-card-info-row">
                  <span className="label">Diện tích:</span>
                  <span className="value">{item.DienTich} m²</span>
                </div>
              )}
            </div>

            <div className="apartment-card-actions">
              <button className="btn btn-ghost" onClick={() => openEdit(item)}>Sửa</button>
              <button className="btn btn-dark" onClick={() => {}}>Chi tiết</button>
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



      {/* MODAL */}
      <Modal
        title={editingRecord ? 'Sửa căn hộ' : 'Thêm căn hộ mới'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingRecord(null); form.resetFields(); }}
        onOk={() => form.submit()}
        okText={editingRecord ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="SoPhong" label="Số phòng" rules={[{ required: true, message: 'Vui lòng nhập số phòng' }]}>
            <Input placeholder="VD: A-2405, B-1202..." />
          </Form.Item>
          <Form.Item name="MaToaNha" label="Tòa nhà" rules={[{ required: true, message: 'Vui lòng chọn tòa nhà' }]}>
            <Select placeholder="Chọn tòa nhà" options={toaNhaList.map(t => ({ label: t.TenToaNha, value: t.MaToaNha }))} />
          </Form.Item>
          <Form.Item name="TrangThai" label="Trạng thái" initialValue="Hoạt động">
            <Select options={[
              { label: 'Hoạt động (Tự động theo cư dân)', value: 'Hoạt động' },
              { label: 'Bảo trì', value: 'Bảo trì' },
            ]} />
          </Form.Item>
          <Form.Item name="DienTich" label="Diện tích (m²)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập diện tích" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
