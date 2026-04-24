'use client';

import { useEffect, useState, useMemo } from 'react';
import { Modal, Form, Select, InputNumber, DatePicker, message, Popconfirm } from 'antd';
import chiSoDichVuService from '@/services/chiSoDichVuService';
import dichVuService from '@/services/dichVuService';
import hoaDonService from '@/services/hoaDonService';
import dayjs from 'dayjs';

// Icon mapping cho từng loại dịch vụ
const dichVuIcons = {
  'Tiền nước': { icon: '💧', color: '#3b82f6', bg: '#eff6ff' },
  'Tiền điện': { icon: '⚡', color: '#f59e0b', bg: '#fffbeb' },
  'Gửi xe': { icon: '🚗', color: '#8b5cf6', bg: '#f5f3ff' },
  'Phí quản lý': { icon: '🏢', color: '#06b6d4', bg: '#ecfeff' },
  'Phí Rác': { icon: '🗑️', color: '#10b981', bg: '#ecfdf5' },
  'Phí rác': { icon: '🗑️', color: '#10b981', bg: '#ecfdf5' },
};

const getIconForDV = (tenDV) => {
  for (const key in dichVuIcons) {
    if (tenDV?.toLowerCase().includes(key.toLowerCase())) return dichVuIcons[key];
  }
  return { icon: '📋', color: '#6b7280', bg: '#f3f4f6' };
};

export default function ChiSoDichVuPage() {
  const [data, setData] = useState([]);
  const [dichVuList, setDichVuList] = useState([]);
  const [hoaDonList, setHoaDonList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedDVType, setSelectedDVType] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [form] = Form.useForm();

  useEffect(() => { fetchData(); fetchDichVu(); fetchHoaDon(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await chiSoDichVuService.getAll();
      setData(res.data?.data || []);
    } catch { message.error('Lỗi tải danh sách chỉ số'); }
    finally { setLoading(false); }
  };

  const fetchDichVu = async () => {
    try { const res = await dichVuService.getAll(); setDichVuList(res.data?.data || []); } catch {}
  };

  const fetchHoaDon = async () => {
    try { const res = await hoaDonService.getAll(); setHoaDonList(res.data?.data || []); } catch {}
  };

  // Lấy danh sách tháng có dữ liệu
  const availableMonths = useMemo(() => {
    const months = new Set();
    data.forEach(item => {
      if (item.ThangThu) months.add(item.ThangThu);
      else if (item.NgayGhi) {
        const d = new Date(item.NgayGhi);
        months.add(`${d.getMonth() + 1}/${d.getFullYear()}`);
      }
    });
    return Array.from(months).sort((a, b) => {
      const [mA, yA] = a.split('/').map(Number);
      const [mB, yB] = b.split('/').map(Number);
      return yB - yA || mB - mA;
    });
  }, [data]);

  // Lấy danh sách phòng có dữ liệu
  const availableRooms = useMemo(() => {
    const rooms = new Set();
    data.forEach(item => {
      if (item.SoPhong) rooms.add(item.SoPhong);
    });
    return Array.from(rooms).sort();
  }, [data]);

  // Lọc dữ liệu theo tháng + phòng
  const filteredData = useMemo(() => {
    let result = data;
    if (filterMonth) {
      result = result.filter(item => {
        if (item.ThangThu === filterMonth) return true;
        if (item.NgayGhi) {
          const d = new Date(item.NgayGhi);
          return `${d.getMonth() + 1}/${d.getFullYear()}` === filterMonth;
        }
        return false;
      });
    }
    if (filterRoom) {
      result = result.filter(item => (item.SoPhong || 'Chưa gán phòng') === filterRoom);
    }
    return result;
  }, [data, filterMonth, filterRoom]);

  // Nhóm theo phòng (SoPhong)
  const groupedByRoom = useMemo(() => {
    const groups = {};
    filteredData.forEach(item => {
      const key = item.SoPhong || 'Chưa gán phòng';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [filteredData]);

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        NgayGhi: values.NgayGhi ? values.NgayGhi.format('YYYY-MM-DD') : undefined,
      };
      if (editingRecord) {
        await chiSoDichVuService.update(editingRecord.MaGhi, payload);
        message.success('Cập nhật chỉ số thành công');
      } else {
        await chiSoDichVuService.create(payload);
        message.success('Thêm chỉ số thành công');
      }
      setModalOpen(false); form.resetFields(); setEditingRecord(null);
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Thao tác thất bại'); }
  };

  const handleDelete = async (MaGhi) => {
    try {
      await chiSoDichVuService.delete(MaGhi);
      message.success('Xóa chỉ số thành công');
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Xóa thất bại'); }
  };

  const handleDVChange = (MaDichVu) => {
    const dv = dichVuList.find(d => d.MaDichVu === MaDichVu);
    setSelectedDVType(dv?.LoaiDichVu || null);
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    handleDVChange(record.MaDichVu);
    form.setFieldsValue({
      ...record,
      NgayGhi: record.NgayGhi ? dayjs(record.NgayGhi) : undefined,
    });
    setModalOpen(true);
  };

  const formatCurrency = (val) => {
    return `${Number(val || 0).toLocaleString('vi-VN')} đ`;
  };

  const calcThanhTien = (item) => {
    const donGia = item.DonGia || 0;
    if (item.ChiSoHienTai != null && item.ChiSoLanGhiTruoc != null) {
      const used = item.ChiSoHienTai - item.ChiSoLanGhiTruoc;
      return used > 0 ? used * donGia : 0;
    }
    return (item.SoLuong || 1) * donGia;
  };

  const totalAll = filteredData.reduce((sum, item) => sum + calcThanhTien(item), 0);
  const roomKeys = Object.keys(groupedByRoom);

  return (
    <div className="page-fade-in">
      {/* HEADER */}
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>📊 Quản lý Chỉ số dịch vụ</h1>
          <p>Theo dõi chỉ số điện, nước và các dịch vụ theo từng căn hộ.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => {
            setEditingRecord(null); setSelectedDVType(null); form.resetFields(); setModalOpen(true);
          }}>
            <span>+</span> Thêm chỉ số
          </button>
        </div>
      </div>

      {/* FILTER + SUMMARY BAR */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--card-bg)', border: '1px solid var(--border-color)',
          borderRadius: 12, padding: '8px 16px'
        }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>📅 Tháng:</span>
          <select
            className="filter-select"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            style={{ minWidth: 140, border: 'none', background: 'transparent', fontSize: 14, fontWeight: 600 }}
          >
            <option value="">Tất cả tháng</option>
            {availableMonths.map(m => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--card-bg)', border: '1px solid var(--border-color)',
          borderRadius: 12, padding: '8px 16px'
        }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>🏠 Phòng:</span>
          <select
            className="filter-select"
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            style={{ minWidth: 140, border: 'none', background: 'transparent', fontSize: 14, fontWeight: 600 }}
          >
            <option value="">Tất cả phòng</option>
            {availableRooms.map(r => (
              <option key={r} value={r}>Phòng {r}</option>
            ))}
          </select>
        </div>

        {/* Summary chips */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{
            padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600,
            background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6
          }}>
            🏠 {roomKeys.length} phòng
          </div>
          <div style={{
            padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600,
            background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6
          }}>
            📋 {filteredData.length} bản ghi
          </div>
          <div style={{
            padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600,
            background: '#fefce8', color: '#ca8a04', display: 'flex', alignItems: 'center', gap: 6
          }}>
            💰 Tổng: {formatCurrency(totalAll)}
          </div>
        </div>
      </div>

      {/* ROOM CARDS */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: 24 }}>
              <div className="skeleton skeleton-line title" style={{ width: 200, marginBottom: 20 }} />
              <div className="skeleton skeleton-line long" style={{ height: 48, marginBottom: 12 }} />
              <div className="skeleton skeleton-line long" style={{ height: 48, marginBottom: 12 }} />
              <div className="skeleton skeleton-line medium" style={{ height: 48 }} />
            </div>
          ))}
        </div>
      ) : roomKeys.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {roomKeys.map(roomName => {
            const items = groupedByRoom[roomName];
            const roomTotal = items.reduce((sum, item) => sum + calcThanhTien(item), 0);
            const thangThu = items[0]?.ThangThu || '';

            return (
              <div className="card" key={roomName} style={{ padding: 0, overflow: 'hidden' }}>
                {/* Card Header */}
                <div style={{
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, #1a2332 0%, #2d4a6f 100%)',
                  color: 'white',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20
                    }}>🏠</div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700 }}>Phòng {roomName}</div>
                      {thangThu && (
                        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                          Kỳ thu: Tháng {thangThu}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, opacity: 0.6 }}>Tổng tiền dịch vụ</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#ffd60a' }}>
                      {formatCurrency(roomTotal)}
                    </div>
                  </div>
                </div>

                {/* Card Body - Service items */}
                <div style={{ padding: '8px 16px' }}>
                  {items.map((item, idx) => {
                    const dvInfo = getIconForDV(item.TenDichVu);
                    const isChiSo = item.ChiSoHienTai != null && item.ChiSoLanGhiTruoc != null;
                    const tieuThu = isChiSo ? item.ChiSoHienTai - item.ChiSoLanGhiTruoc : null;
                    const thanhTien = calcThanhTien(item);

                    return (
                      <div key={item.MaGhi} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 8px',
                        borderBottom: idx < items.length - 1 ? '1px solid var(--border-color)' : 'none',
                      }}>
                        {/* Icon */}
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: dvInfo.bg, color: dvInfo.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 20, flexShrink: 0
                        }}>
                          {dvInfo.icon}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                            {item.TenDichVu || 'Dịch vụ'}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {isChiSo ? (
                              <>
                                <span>CS cũ: <strong style={{ color: 'var(--text-secondary)' }}>{item.ChiSoLanGhiTruoc}</strong></span>
                                <span>→</span>
                                <span>CS mới: <strong style={{ color: dvInfo.color }}>{item.ChiSoHienTai}</strong></span>
                                <span style={{
                                  background: dvInfo.bg, color: dvInfo.color,
                                  padding: '1px 8px', borderRadius: 6, fontWeight: 700, fontSize: 11
                                }}>
                                  Tiêu thụ: {tieuThu} {item.DonViTinh || ''}
                                </span>
                              </>
                            ) : (
                              <span>Số lượng: <strong style={{ color: 'var(--text-secondary)' }}>{item.SoLuong || 1}</strong></span>
                            )}
                            {item.NgayGhi && (
                              <span>• {new Date(item.NgayGhi).toLocaleDateString('vi-VN')}</span>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {formatCurrency(thanhTien)}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            ĐG: {formatCurrency(item.DonGia)}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          <button
                            className="btn-ghost"
                            onClick={() => openEdit(item)}
                            style={{
                              width: 32, height: 32, borderRadius: 8, padding: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: '1px solid var(--border-color)', fontSize: 14, cursor: 'pointer'
                            }}
                            title="Sửa"
                          >✏️</button>
                          <Popconfirm title="Xác nhận xóa bản ghi này?" onConfirm={() => handleDelete(item.MaGhi)} okText="Xóa" cancelText="Hủy">
                            <button
                              className="btn-ghost"
                              style={{
                                width: 32, height: 32, borderRadius: 8, padding: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid #fee2e2', color: '#ef4444', fontSize: 14, cursor: 'pointer'
                              }}
                              title="Xóa"
                            >🗑️</button>
                          </Popconfirm>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📊</span>
          <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px' }}>Chưa có dữ liệu chỉ số</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {filterMonth ? `Không tìm thấy bản ghi nào cho tháng ${filterMonth}` : 'Bấm "Thêm chỉ số" để bắt đầu ghi nhận.'}
          </p>
        </div>
      )}

      {/* MODAL */}
      <Modal title={editingRecord ? 'Sửa chỉ số' : 'Thêm chỉ số mới'} open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingRecord(null); form.resetFields(); setSelectedDVType(null); }}
        onOk={() => form.submit()} okText={editingRecord ? 'Cập nhật' : 'Thêm'} cancelText="Hủy">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="MaDichVu" label="Dịch vụ" rules={[{ required: true, message: 'Chọn dịch vụ' }]}>
            <Select placeholder="Chọn dịch vụ" onChange={handleDVChange}
              options={dichVuList.map(d => ({ label: `${d.TenDichVu} (${d.LoaiDichVu === 1 ? 'Theo chỉ số' : 'Cố định'})`, value: d.MaDichVu }))} />
          </Form.Item>
          <Form.Item name="MaHoaDon" label="Hóa đơn">
            <Select allowClear placeholder="Liên kết hóa đơn"
              options={hoaDonList.map(h => ({ label: `Phòng ${h.SoPhong || '?'} - ${h.ThangThu || ''} (${h.TrangThai})`, value: h.MaHoaDon }))} />
          </Form.Item>
          {(selectedDVType === 1 || selectedDVType === null) && (
            <>
              <Form.Item name="ChiSoLanGhiTruoc" label="Chỉ số lần ghi trước">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập chỉ số cũ" />
              </Form.Item>
              <Form.Item name="ChiSoHienTai" label="Chỉ số hiện tại">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập chỉ số mới" />
              </Form.Item>
            </>
          )}
          {(selectedDVType === 2 || selectedDVType === null) && (
            <Form.Item name="SoLuong" label="Số lượng">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập số lượng" />
            </Form.Item>
          )}
          <Form.Item name="NgayGhi" label="Ngày ghi">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày ghi" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
