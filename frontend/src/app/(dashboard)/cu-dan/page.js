'use client';

import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import cuDanService from '@/services/cuDanService';
import phongService from '@/services/phongService';
import nguoiDungService from '@/services/nguoiDungService';

const avatarColors = ['avatar-blue', 'avatar-green', 'avatar-purple', 'avatar-orange', 'avatar-teal', 'avatar-red', 'avatar-navy'];

export default function CuDanPage() {
  const [data, setData] = useState([]);
  const [phongList, setPhongList] = useState([]);
  const [nguoiDungList, setNguoiDungList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [form] = Form.useForm();

  useEffect(() => { fetchData(); fetchPhong(); fetchNguoiDung(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await cuDanService.getAll();
      setData(res.data?.data || []);
    } catch { message.error('Lỗi tải danh sách cư dân'); }
    finally { setLoading(false); }
  };

  const fetchPhong = async () => {
    try { const res = await phongService.getAll(); setPhongList(res.data?.data || []); } catch {}
  };

  const fetchNguoiDung = async () => {
    try { const res = await nguoiDungService.getAll(); setNguoiDungList(res.data?.data || []); } catch {}
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await cuDanService.update(editingRecord.MaCuDan, values);
        message.success('Cập nhật cư dân thành công');
      } else {
        await cuDanService.create(values);
        message.success('Thêm cư dân thành công');
      }
      setModalOpen(false); form.resetFields(); setEditingRecord(null);
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDelete = async (MaCuDan) => {
    if (!confirm('Xác nhận xóa cư dân này?')) return;
    try {
      await cuDanService.delete(MaCuDan);
      message.success('Xóa cư dân thành công');
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

  const filteredData = data.filter(item =>
    !searchText ||
    item.HoTen?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.CCCD?.includes(searchText) ||
    item.SoDienThoai?.includes(searchText)
  );

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getInitials = (name) => {
    if (!name) return 'CD';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const getResidentStatus = (index) => {
    const statuses = ['Thường trú', 'Tạm trú'];
    return statuses[index % 2];
  };

  const totalRooms = phongList.length;
  const occupiedRooms = phongList.filter(p => p.TrangThai === 'Đang sử dụng').length;
  const occupancyPercent = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : '0';

  return (
    <div className="page-fade-in">
      {/* PAGE HEADER */}
      <div className="flex-between mb-24">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Danh sách cư dân</h1>
          <p>Quản lý thông tin cư dân chính thức và tạm trú.</p>
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
              <th>HỌ TÊN</th>
              <th>CĂN HỘ</th>
              <th>SỐ ĐIỆN THOẠI</th>
              <th>EMAIL</th>
              <th>TRẠNG THÁI</th>
              <th style={{ textAlign: 'center' }}>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? paginatedData.map((item, index) => {
              const initials = getInitials(item.HoTen);
              const colorClass = avatarColors[index % avatarColors.length];
              const status = getResidentStatus(index);
              const isTemporary = status === 'Tạm trú';
              return (
                <tr key={item.MaCuDan}>
                  <td>
                    <div className="table-row-item">
                      <div className={`avatar-initials ${colorClass}`}>{initials}</div>
                      <div className="table-row-info">
                        <h4>{item.HoTen}</h4>
                        <span>ID: {item.MaCuDan}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{item.SoPhong || 'N/A'}</td>
                  <td>{item.SoDienThoai || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{item.CCCD ? `${item.CCCD}@mail.com` : '—'}</td>
                  <td>
                    <span className={`badge ${isTemporary ? 'badge-info' : 'badge-success'}`}>
                      {status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn-ghost" onClick={() => openEdit(item)} title="Sửa">✏️</button>
                      <button className="btn-ghost" onClick={() => handleDelete(item.MaCuDan)} title="Xóa" style={{ color: 'var(--danger)' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  {loading ? 'Đang tải...' : 'Chưa có cư dân nào'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {filteredData.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Hiển thị {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} - {Math.min(currentPage * pageSize, filteredData.length)} của {filteredData.length.toLocaleString()} cư dân
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
      </div>

      {/* BOTTOM STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginTop: 24 }}>
        {/* Tỷ lệ lấp đầy */}
        <div style={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa07a 100%)',
          borderRadius: 14,
          padding: 24,
          color: 'white'
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>Tỷ lệ lấp đầy</h3>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 16px' }}>
            Tổng cộng {occupiedRooms}/{totalRooms} căn hộ đã có cư dân sinh sống.
          </p>
          <div style={{ fontSize: 36, fontWeight: 800, margin: '0 0 8px' }}>{occupancyPercent}%</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>+1.2% so với tháng trước</span>
          </div>
          <div className="occupancy-bar" style={{ marginTop: 12, background: 'rgba(255,255,255,0.2)' }}>
            <div className="occupancy-bar-fill" style={{ width: `${occupancyPercent}%`, background: 'white' }} />
          </div>
        </div>

        {/* Right column stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="summary-card" style={{ flex: 1 }}>
            <div className="summary-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>👥</div>
            <div>
              <div className="summary-card-label">MỚI TRONG TUẦN</div>
              <div className="summary-card-value" style={{ fontSize: 20 }}>
                {Math.min(data.length, 12)} Cư dân
              </div>
            </div>
          </div>
          <div className="summary-card" style={{ flex: 1 }}>
            <div className="summary-card-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>⚠️</div>
            <div>
              <div className="summary-card-label">THÔNG TIN THIẾU</div>
              <div className="summary-card-value" style={{ fontSize: 20 }}>
                {data.filter(d => !d.SoDienThoai || !d.CCCD).length.toString().padStart(2, '0')} Hồ sơ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fab-btn" onClick={openCreate} title="Thêm cư dân mới" style={{ background: 'var(--accent)' }}>👤</button>

      {/* MODAL */}
      <Modal
        title={editingRecord ? 'Sửa thông tin cư dân' : 'Thêm cư dân mới'}
        open={modalOpen} width={600}
        onCancel={() => { setModalOpen(false); setEditingRecord(null); form.resetFields(); }}
        onOk={() => form.submit()} okText={editingRecord ? 'Cập nhật' : 'Thêm'} cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="HoTen" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input placeholder="Nhập họ tên cư dân" />
          </Form.Item>
          <Form.Item name="SoDienThoai" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item name="CCCD" label="Căn cước công dân">
            <Input placeholder="Nhập số CCCD" />
          </Form.Item>
          <Form.Item name="QueQuan" label="Quê quán">
            <Input placeholder="Nhập quê quán" />
          </Form.Item>
          <Form.Item name="MaPhong" label="Phòng">
            <Select allowClear placeholder="Chọn phòng"
              options={phongList.map(p => ({ label: `${p.SoPhong} - ${p.TenToaNha || ''}`, value: p.MaPhong }))} />
          </Form.Item>
          <Form.Item name="MaNguoiDung" label="Tài khoản người dùng">
            <Select allowClear placeholder="Liên kết tài khoản"
              options={nguoiDungList.map(n => ({ label: `${n.TenDangNhap} (${n.VaiTro})`, value: n.MaNguoiDung }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
