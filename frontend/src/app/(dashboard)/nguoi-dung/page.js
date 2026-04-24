'use client';

import { useEffect, useState, useMemo } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import nguoiDungService from '@/services/nguoiDungService';

const roleConfig = {
  admin: { label: 'Ban quản lý', color: '#ff3b30', bg: '#ffe5e3', icon: '👑' },
  cudan: { label: 'Cư dân', color: '#4a90d9', bg: '#e8f0fb', icon: '🏠' },
  kythuat: { label: 'Kỹ thuật', color: '#ff9500', bg: '#fff5e6', icon: '🔧' },
};

const statusConfig = {
  'Hoạt động': { color: '#34c759', bg: '#e8f8ed', dot: '●' },
  'Bị khóa': { color: '#ff3b30', bg: '#ffe5e3', dot: '●' },
};

const avatarColors = ['#4a90d9', '#34c759', '#9b59b6', '#ff9500', '#2ac3a2', '#ff3b30', '#1a2332'];

export default function NguoiDungPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await nguoiDungService.getAll();
      setData(res.data?.data || []);
    } catch { message.error('Lỗi tải danh sách người dùng'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await nguoiDungService.update(editingRecord.MaNguoiDung, values);
        message.success('Cập nhật người dùng thành công');
      } else {
        await nguoiDungService.register(values);
        message.success('Thêm người dùng thành công');
      }
      setModalOpen(false); form.resetFields(); setEditingRecord(null);
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Thao tác thất bại'); }
  };

  const handleSetRole = async (values) => {
    try {
      await nguoiDungService.setRole(editingRecord.MaNguoiDung, values);
      message.success('Cập nhật quyền thành công');
      setRoleModalOpen(false); roleForm.resetFields(); setEditingRecord(null);
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Cập nhật quyền thất bại'); }
  };

  const handleDelete = async (MaNguoiDung) => {
    if (!confirm('Xác nhận xóa người dùng này? Hành động này không thể hoàn tác.')) return;
    try {
      await nguoiDungService.delete(MaNguoiDung);
      message.success('Xóa người dùng thành công');
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Xóa thất bại'); }
  };

  const handleToggleStatus = async (record) => {
    const newStatus = record.TrangThai === 'Hoạt động' ? 'Bị khóa' : 'Hoạt động';
    try {
      await nguoiDungService.update(record.MaNguoiDung, { TrangThai: newStatus });
      message.success(`Đã ${newStatus === 'Hoạt động' ? 'kích hoạt' : 'khóa'} tài khoản`);
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Thao tác thất bại'); }
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

  const openRoleModal = (record) => {
    setEditingRecord(record);
    roleForm.setFieldsValue({ VaiTro: record.VaiTro });
    setRoleModalOpen(true);
  };

  // Filtering & search
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = !searchText ||
        item.TenDangNhap?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.Email?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.MaNguoiDung?.toLowerCase().includes(searchText.toLowerCase());
      const matchRole = filterRole === 'all' || item.VaiTro === filterRole;
      const matchStatus = filterStatus === 'all' || item.TrangThai === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [data, searchText, filterRole, filterStatus]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Stats
  const stats = useMemo(() => ({
    total: data.length,
    active: data.filter(d => d.TrangThai === 'Hoạt động').length,
    locked: data.filter(d => d.TrangThai === 'Bị khóa').length,
    admins: data.filter(d => d.VaiTro === 'admin').length,
    cudan: data.filter(d => d.VaiTro === 'cudan').length,
    kythuat: data.filter(d => d.VaiTro === 'kythuat').length,
  }), [data]);

  const getInitials = (name) => {
    if (!name) return 'ND';
    return name.split(/[._\s]/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (str) => {
    if (!str) return avatarColors[0];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  return (
    <div>
      {/* PAGE HEADER */}
      <div className="flex-between mb-24">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Quản lý Người dùng</h1>
          <p>Quản lý tài khoản truy cập hệ thống và phân quyền người dùng.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" onClick={() => { setFilterRole('all'); setFilterStatus('all'); setSearchText(''); }}>
            <span>🔄</span> Làm mới
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            <span>+</span> Thêm người dùng
          </button>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="stats-row" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-label">TỔNG TÀI KHOẢN</div>
          <div className="stat-card-value">{stats.total.toString().padStart(2, '0')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">ĐANG HOẠT ĐỘNG</div>
          <div className="stat-card-value" style={{ color: 'var(--success)' }}>{stats.active.toString().padStart(2, '0')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">BỊ KHÓA</div>
          <div className="stat-card-value" style={{ color: 'var(--danger)' }}>{stats.locked.toString().padStart(2, '0')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">BAN QUẢN LÝ</div>
          <div className="stat-card-value" style={{ color: 'var(--accent)' }}>{stats.admins.toString().padStart(2, '0')}</div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>🔍</span>
          <input
            type="text"
            className="form-input"
            placeholder="Tìm theo tên, email, mã..."
            value={searchText}
            onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <select className="filter-select" value={filterRole} onChange={e => { setFilterRole(e.target.value); setCurrentPage(1); }}>
          <option value="all">Tất cả vai trò</option>
          <option value="admin">Ban quản lý</option>
          <option value="cudan">Cư dân</option>
          <option value="kythuat">Kỹ thuật</option>
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
          <option value="all">Tất cả trạng thái</option>
          <option value="Hoạt động">Hoạt động</option>
          <option value="Bị khóa">Bị khóa</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>NGƯỜI DÙNG</th>
              <th>EMAIL</th>
              <th>VAI TRÒ</th>
              <th>TRẠNG THÁI</th>
              <th style={{ textAlign: 'center' }}>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? paginatedData.map((item) => {
              const initials = getInitials(item.TenDangNhap);
              const bgColor = getAvatarColor(item.MaNguoiDung);
              const role = roleConfig[item.VaiTro] || roleConfig.cudan;
              const status = statusConfig[item.TrangThai] || statusConfig['Hoạt động'];
              return (
                <tr key={item.MaNguoiDung}>
                  <td>
                    <div className="table-row-item">
                      <div style={{
                        width: 42, height: 42, borderRadius: '50%',
                        background: bgColor, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: 'white', fontSize: 14,
                        fontWeight: 700, flexShrink: 0,
                        boxShadow: `0 2px 8px ${bgColor}40`
                      }}>
                        {initials}
                      </div>
                      <div className="table-row-info">
                        <h4>{item.TenDangNhap}</h4>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {item.MaNguoiDung}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: item.Email ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {item.Email || '— Chưa cập nhật'}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 12px', borderRadius: 20,
                      background: role.bg, color: role.color,
                      fontSize: 12, fontWeight: 600
                    }}>
                      <span style={{ fontSize: 13 }}>{role.icon}</span>
                      {role.label}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '4px 12px', borderRadius: 20,
                      background: status.bg, color: status.color,
                      fontSize: 12, fontWeight: 600
                    }}>
                      <span style={{ fontSize: 8 }}>{status.dot}</span>
                      {item.TrangThai}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn-ghost" onClick={() => openEdit(item)} title="Sửa thông tin">
                        ✏️
                      </button>
                      <button className="btn-ghost" onClick={() => openRoleModal(item)} title="Phân quyền"
                        style={{ color: 'var(--accent)' }}>
                        👑
                      </button>
                      <button
                        className="btn-ghost"
                        onClick={() => handleToggleStatus(item)}
                        title={item.TrangThai === 'Hoạt động' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                        style={{ color: item.TrangThai === 'Hoạt động' ? 'var(--warning)' : 'var(--success)' }}
                      >
                        {item.TrangThai === 'Hoạt động' ? '🔒' : '🔓'}
                      </button>
                      <button className="btn-ghost" onClick={() => handleDelete(item.MaNguoiDung)}
                        title="Xóa" style={{ color: 'var(--danger)' }}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
                  {loading ? 'Đang tải dữ liệu...' : filteredData.length === 0 && data.length > 0
                    ? 'Không tìm thấy người dùng phù hợp'
                    : 'Chưa có người dùng nào trong hệ thống'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {filteredData.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Hiển thị {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} - {Math.min(currentPage * pageSize, filteredData.length)} của {filteredData.length} người dùng
            </div>
            <div className="pagination-buttons">
              <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >{pageNum}</button>
                );
              })}
              <button className="pagination-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM SECTION - Role distribution & Security */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 4 }}>
        {/* Role Distribution */}
        <div className="card">
          <div className="card-title">Phân bổ vai trò</div>
          <div className="card-subtitle">Thống kê số lượng người dùng theo từng vai trò</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(roleConfig).map(([key, cfg]) => {
              const count = data.filter(d => d.VaiTro === key).length;
              const percent = data.length > 0 ? (count / data.length * 100) : 0;
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: cfg.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 16, flexShrink: 0
                  }}>
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{cfg.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{count} người</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#f0f2f5', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${percent}%`, height: '100%', background: cfg.color,
                        borderRadius: 3, transition: 'width 0.6s ease'
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Info */}
        <div style={{
          background: 'linear-gradient(135deg, #1a2332 0%, #2d4a6f 100%)',
          borderRadius: 14, padding: 24, color: 'white',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(74,144,217,0.2)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 22
              }}>
                🛡️
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Bảo mật hệ thống</h3>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Thông tin bảo mật tài khoản</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Tài khoản hoạt động</span>
                <span style={{ fontSize: 20, fontWeight: 800 }}>{stats.active}</span>
              </div>
              <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Tài khoản bị khóa</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#ff6b6b' }}>{stats.locked}</span>
              </div>
              <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Tỷ lệ an toàn</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#2ac3a2' }}>
                  {data.length > 0 ? Math.round(stats.active / data.length * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
          <div style={{
            marginTop: 20, padding: '12px 16px', background: 'rgba(74,144,217,0.15)',
            borderRadius: 10, fontSize: 12, color: 'rgba(255,255,255,0.6)',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span>💡</span>
            Đảm bảo chỉ cấp quyền Admin cho người được ủy quyền.
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fab-btn" onClick={openCreate} title="Thêm người dùng mới" style={{ background: 'var(--accent)' }}>👤</button>

      {/* MODAL - Thêm / Sửa */}
      <Modal
        title={editingRecord ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        open={modalOpen} width={520}
        onCancel={() => { setModalOpen(false); setEditingRecord(null); form.resetFields(); }}
        onOk={() => form.submit()} okText={editingRecord ? 'Cập nhật' : 'Tạo tài khoản'} cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!editingRecord && (
            <>
              <Form.Item name="TenDangNhap" label="Tên đăng nhập"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}>
                <Input placeholder="Nhập tên đăng nhập" prefix={<span style={{ color: 'var(--text-muted)' }}>👤</span>} />
              </Form.Item>
              <Form.Item name="MatKhau" label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                ]}>
                <Input.Password placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)" />
              </Form.Item>
            </>
          )}
          <Form.Item name="Email" label="Email"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
            <Input placeholder="Nhập email" prefix={<span style={{ color: 'var(--text-muted)' }}>✉️</span>} />
          </Form.Item>
          {!editingRecord && (
            <Form.Item name="VaiTro" label="Vai trò" initialValue="cudan">
              <Select options={[
                { label: '👑 Ban quản lý', value: 'admin' },
                { label: '🏠 Cư dân', value: 'cudan' },
                { label: '🔧 Kỹ thuật', value: 'kythuat' },
              ]} />
            </Form.Item>
          )}
          {editingRecord && (
            <Form.Item name="TrangThai" label="Trạng thái">
              <Select options={[
                { label: '● Hoạt động', value: 'Hoạt động' },
                { label: '● Bị khóa', value: 'Bị khóa' },
              ]} />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* MODAL - Phân quyền */}
      <Modal
        title="Phân quyền người dùng"
        open={roleModalOpen}
        onCancel={() => { setRoleModalOpen(false); setEditingRecord(null); roleForm.resetFields(); }}
        onOk={() => roleForm.submit()} okText="Cập nhật quyền" cancelText="Hủy"
      >
        {editingRecord && (
          <div style={{
            background: 'var(--info-bg)', borderRadius: 10, padding: 16,
            marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: getAvatarColor(editingRecord.MaNguoiDung),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 15, fontWeight: 700
            }}>
              {getInitials(editingRecord.TenDangNhap)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{editingRecord.TenDangNhap}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Vai trò hiện tại: {roleConfig[editingRecord.VaiTro]?.label || editingRecord.VaiTro}
              </div>
            </div>
          </div>
        )}
        <Form form={roleForm} layout="vertical" onFinish={handleSetRole}>
          <Form.Item name="VaiTro" label="Vai trò mới" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
            <Select options={[
              { label: '👑 Ban quản lý (admin) — Toàn quyền quản trị', value: 'admin' },
              { label: '🏠 Cư dân (cudan) — Xem thông tin cá nhân', value: 'cudan' },
              { label: '🔧 Kỹ thuật (kythuat) — Quản lý sự cố', value: 'kythuat' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
