'use client';

import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, message } from 'antd';
import toaNhaService from '@/services/toaNhaService';
import phongService from '@/services/phongService';

export default function ToaNhaPage() {
  const [data, setData] = useState([]);
  const [phongList, setPhongList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const [form] = Form.useForm();

  useEffect(() => { fetchData(); fetchPhong(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await toaNhaService.getAll();
      setData(res.data?.data || []);
    } catch { message.error('Lỗi tải danh sách tòa nhà'); }
    finally { setLoading(false); }
  };

  const fetchPhong = async () => {
    try {
      const res = await phongService.getAll();
      setPhongList(res.data?.data || []);
    } catch {}
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await toaNhaService.update(editingRecord.MaToaNha, values);
        message.success('Cập nhật tòa nhà thành công');
      } else {
        await toaNhaService.create(values);
        message.success('Thêm tòa nhà thành công');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingRecord(null);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (MaToaNha) => {
    if (!confirm('Xác nhận xóa tòa nhà này?')) return;
    try {
      await toaNhaService.delete(MaToaNha);
      message.success('Xóa tòa nhà thành công');
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Xóa thất bại');
    }
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

  // Get room counts per building
  const getRoomCount = (maToaNha) => {
    return phongList.filter(p => p.MaToaNha === maToaNha).length;
  };

  const getOccupancy = (maToaNha) => {
    const rooms = phongList.filter(p => p.MaToaNha === maToaNha);
    if (rooms.length === 0) return 0;
    const occupied = rooms.filter(p => p.TrangThai === 'Đang sử dụng').length;
    return Math.round((occupied / rooms.length) * 100);
  };

  const filteredData = data.filter(item =>
    !searchText || item.TenToaNha?.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalRooms = phongList.length;
  const occupiedRooms = phongList.filter(p => p.TrangThai === 'Đang sử dụng').length;
  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : '0';

  const buildingIcons = ['🏢', '🏗️', '🏙️', '🏛️'];

  return (
    <div className="page-fade-in">
      {/* PAGE HEADER */}
      <div className="flex-between mb-24">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Quản lý Tòa nhà</h1>
          <p>Danh sách chi tiết các phân khu và tòa nhà thuộc hệ thống.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <span>+</span> Tạo mới
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>TÊN TÒA NHÀ</th>
              <th>SỐ CĂN HỘ TỐI ĐA</th>
              <th>TỔNG SỐ CĂN HỘ</th>
              <th>VỊ TRÍ</th>
              <th style={{ textAlign: 'center' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? paginatedData.map((item, index) => {
              const roomCount = getRoomCount(item.MaToaNha);
              const occ = getOccupancy(item.MaToaNha);
              return (
                <tr key={item.MaToaNha}>
                  <td>
                    <div className="table-row-item">
                      <div className="table-row-icon">{buildingIcons[index % buildingIcons.length]}</div>
                      <div className="table-row-info">
                        <h4>{item.TenToaNha}</h4>
                        <span>Mã: {item.MaToaNha}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <span style={{ fontSize: 20, fontWeight: 700 }}>{item.SoLuongPhong || '--'}</span>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Căn hộ</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 700 }}>{roomCount}</span>
                      {roomCount > 0 && (
                        <span className={`badge ${occ >= 90 ? 'badge-danger' : occ >= 70 ? 'badge-warning' : 'badge-success'}`}>
                          {occ}% Full
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    Khu chung cư
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn-ghost" onClick={() => openEdit(item)} title="Sửa">✏️</button>
                      <button className="btn-ghost" onClick={() => handleDelete(item.MaToaNha)} title="Xóa" style={{ color: 'var(--danger)' }}>🗑️</button>
                      <button className="three-dots">⋮</button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  {loading ? 'Đang tải...' : 'Chưa có tòa nhà nào'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {filteredData.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Hiển thị {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} - {Math.min(currentPage * pageSize, filteredData.length)} trong số {filteredData.length} tòa nhà
            </div>
            <div className="pagination-buttons">
              <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => (
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
      </div>

      {/* SUMMARY STATS */}
      <div className="summary-row">
        <div className="summary-card">
          <div className="summary-card-icon">🏢</div>
          <div>
            <div className="summary-card-label">TỔNG TÒA NHÀ</div>
            <div className="summary-card-value">{data.length.toString().padStart(2, '0')}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>🏠</div>
          <div>
            <div className="summary-card-label">CĂN HỘ HOẠT ĐỘNG</div>
            <div className="summary-card-value">{occupiedRooms.toLocaleString()}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>📈</div>
          <div>
            <div className="summary-card-label">TỶ LỆ LẤP ĐẦY</div>
            <div className="summary-card-value">{occupancyRate}%</div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        title={editingRecord ? 'Sửa tòa nhà' : 'Thêm tòa nhà mới'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingRecord(null); form.resetFields(); }}
        onOk={() => form.submit()}
        okText={editingRecord ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="TenToaNha" label="Tên tòa nhà" rules={[{ required: true, message: 'Vui lòng nhập tên tòa nhà' }]}>
            <Input placeholder="VD: Horizon Tower A, Azure Block B1..." />
          </Form.Item>
          <Form.Item name="SoLuongPhong" label="Số căn hộ tối đa">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập số căn hộ tối đa" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
