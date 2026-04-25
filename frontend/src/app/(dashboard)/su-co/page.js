'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, Typography, message, DatePicker, Card, Row, Col, Badge, Empty, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined, CheckOutlined, ClockCircleOutlined, ToolOutlined, CheckCircleOutlined, UserOutlined, HomeOutlined } from '@ant-design/icons';
import suCoService from '@/services/suCoService';
import phongService from '@/services/phongService';
import cuDanService from '@/services/cuDanService';
import useAuthStore from '@/store/authStore';

const { Title } = Typography;
const { TextArea } = Input;

const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

const trangThaiColors = { 'Chờ duyệt': 'orange', 'Đang xử lý': 'blue', 'Đã xử lý': 'green' };

export default function SuCoPage() {
  const [data, setData] = useState([]);
  const [phongList, setPhongList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [xuLyModalOpen, setXuLyModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filterTrangThai, setFilterTrangThai] = useState(null);
  const [cuDanInfo, setCuDanInfo] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const [xuLyForm] = Form.useForm();
  const { user } = useAuthStore();
  const isAdmin = user?.VaiTro === 'admin';

  useEffect(() => {
    if (user) {
      fetchData();
      if (!isAdmin) fetchResidentInfo();
      else fetchPhong();
    }
  }, [user]);

  const fetchResidentInfo = async () => {
    try {
      const res = await cuDanService.getByNguoiDung(user.MaNguoiDung);
      setCuDanInfo(res.data?.data);
    } catch {}
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (isAdmin) {
        res = await suCoService.getAll();
      } else {
        res = await suCoService.getByNguoiBao(user.MaNguoiDung);
      }
      setData(res.data?.data || []);
    } catch { message.error('Lỗi tải danh sách sự cố'); }
    finally { setLoading(false); }
  };

  const fetchPhong = async () => {
    try { const res = await phongService.getAll(); setPhongList(res.data?.data || []); } catch {}
  };

  const handleSubmit = async (values) => {
    try {
      let finalImageUrl = '';
      
      // Lấy danh sách URL từ fileList (do đã dùng valuePropName="fileList")
      const currentFileList = values.AnhSuCo;
      if (currentFileList && currentFileList.length > 0) {
        const urls = currentFileList.map(file => {
          if (file.response?.success !== false && file.response?.url) {
            return file.response.url;
          }
          if (file.url) {
            let url = file.url;
            if (url.startsWith(backendUrl)) {
              url = url.replace(backendUrl, '');
            }
            return url;
          }
          return null;
        }).filter(url => url !== null);
        
        finalImageUrl = urls.join(',');
      }

      const payload = { 
        ...values, 
        AnhSuCo: finalImageUrl,
        MaPhong: values.MaPhong || cuDanInfo?.MaPhong 
      };

      if (editingRecord) {
        await suCoService.update(editingRecord.MaSuCo, payload);
        message.success('Cập nhật sự cố thành công');
      } else {
        await suCoService.create({ ...payload, MaNguoiBao: user?.MaNguoiDung });
        message.success('Báo cáo sự cố thành công');
      }
      setModalOpen(false); 
      form.resetFields(); 
      setFileList([]);
      setEditingRecord(null);
      fetchData();
    } catch (error) { 
      console.error(error);
      message.error(error.response?.data?.message || 'Thao tác thất bại'); 
    }
  };

  const handleXuLy = async (values) => {
    try {
      await suCoService.xuLy(editingRecord.MaSuCo, values);
      message.success('Cập nhật trạng thái sự cố thành công');
      setXuLyModalOpen(false); xuLyForm.resetFields(); setEditingRecord(null);
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Xử lý thất bại'); }
  };

  const handleDelete = async (MaSuCo) => {
    try {
      await suCoService.delete(MaSuCo);
      message.success('Xóa sự cố thành công');
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Xóa thất bại'); }
  };

  const filteredData = filterTrangThai ? data.filter(s => s.TrangThai === filterTrangThai) : data;

  const columns = [
    { title: 'Mã SC', dataIndex: 'MaSuCo', key: 'MaSuCo', width: 140, ellipsis: true },
    { title: 'Tên sự cố', dataIndex: 'TenSuCo', key: 'TenSuCo', ellipsis: true },
    {
      title: 'Ảnh', dataIndex: 'AnhSuCo', key: 'AnhSuCo', width: 100,
      render: (val) => {
        if (!val) return 'No photo';
        const urls = val.split(',');
        return (
          <Space>
            {urls.slice(0, 2).map((url, i) => (
              <img 
                key={i} 
                src={url.startsWith('http') ? url : `${backendUrl}${url}`} 
                style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 4 }} 
              />
            ))}
            {urls.length > 2 && <span style={{ fontSize: 10 }}>+{urls.length - 2}</span>}
          </Space>
        );
      }
    },
    { title: 'Phòng', dataIndex: 'SoPhong', key: 'SoPhong', width: 90 },
    { title: 'Người báo', dataIndex: 'TenNguoiBao', key: 'TenNguoiBao', width: 120 },
    {
      title: 'Ngày báo', dataIndex: 'NgayBaoCao', key: 'NgayBaoCao', width: 110,
      render: (val) => val ? new Date(val).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Trạng thái', dataIndex: 'TrangThai', key: 'TrangThai', width: 130,
      render: (val) => <Tag color={trangThaiColors[val] || 'default'}>{val}</Tag>,
    },
    { title: 'Người xử lý', dataIndex: 'NguoiXuLy', key: 'NguoiXuLy', width: 120 },
    {
      title: 'Thao tác', key: 'actions', width: isAdmin ? 250 : 100,
      render: (_, record) => (
        <Space size="small">
          {isAdmin ? (
            <>
              <Button type="link" size="small" icon={<CheckOutlined />} style={{ color: '#52c41a' }}
                onClick={() => { setEditingRecord(record); xuLyForm.setFieldsValue({ TrangThai: record.TrangThai }); setXuLyModalOpen(true); }}>
                Xử lý
              </Button>
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => {
                setEditingRecord(record); 
                const imageUrls = record.AnhSuCo ? record.AnhSuCo.split(',') : [];
                const formattedRecord = {
                  ...record,
                  AnhSuCo: imageUrls.map((url, idx) => ({
                    uid: `-${idx}`,
                    name: `image-${idx}.png`,
                    status: 'done',
                    url: url,
                    thumbUrl: url.startsWith('http') ? url : `${backendUrl}${url}`
                  }))
                };
                form.setFieldsValue(formattedRecord); 
                setFileList(formattedRecord.AnhSuCo);
                setModalOpen(true);
              }}>Sửa</Button>
              <Popconfirm title="Xác nhận xóa sự cố?" onConfirm={() => handleDelete(record.MaSuCo)} okText="Xóa" cancelText="Hủy">
                <Button type="link" size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
              </Popconfirm>
            </>
          ) : (
            record.TrangThai === 'Chờ duyệt' && (
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => {
                setEditingRecord(record); form.setFieldsValue(record); setModalOpen(true);
              }}>Sửa</Button>
            )
          )}
        </Space>
      ),
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Chờ duyệt': return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'Đang xử lý': return <ToolOutlined style={{ color: '#1890ff' }} />;
      case 'Đã xử lý': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default: return null;
    }
  };

  const getStatusGlow = (status) => {
    switch (status) {
      case 'Chờ duyệt': return 'status-glow-orange';
      case 'Đang xử lý': return 'status-glow-blue';
      case 'Đã xử lý': return 'status-glow-green';
      default: return '';
    }
  };

  const ResidentView = () => (
    <div className="resident-incident-container">
      {/* Welcome Banner */}
      <div className="hero-banner-modern mb-24">
        <div className="hero-content">
          <Badge status="processing" text={<span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>HỖ TRỢ KỸ THUẬT 24/7</span>} />
          <h1 style={{ color: 'white', margin: '8px 0', fontSize: 24, fontWeight: 800 }}>Báo cáo Sự cố & Yêu cầu</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 500, margin: 0 }}>
            Chúng tôi luôn lắng nghe và sẵn sàng hỗ trợ bạn khắc phục mọi vấn đề trong căn hộ của mình một cách nhanh nhất.
          </p>
        </div>
        <button 
          className="btn-glass" 
          onClick={() => { setEditingRecord(null); form.resetFields(); setModalOpen(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <PlusOutlined /> Gửi báo cáo mới
        </button>
      </div>

      {/* Filter & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {['Tất cả', 'Chờ duyệt', 'Đang xử lý', 'Đã xử lý'].map(status => (
            <button 
              key={status}
              onClick={() => setFilterTrangThai(status === 'Tất cả' ? null : status)}
              className={`filter-chip ${((!filterTrangThai && status === 'Tất cả') || filterTrangThai === status) ? 'active' : ''}`}
            >
              {status}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Tổng cộng: <b>{filteredData.length}</b> sự cố
        </div>
      </div>

      {/* Incident List */}
      {filteredData.length > 0 ? (
        <Row gutter={[20, 20]}>
          {filteredData.map((item) => (
            <Col key={item.key || item.MaSuCo} xs={24} sm={24} md={12} lg={12} xl={8} xxl={8}>
              <Card 
                className="incident-card-premium"
                variant="borderless"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div className={`status-badge-modern ${getStatusGlow(item.TrangThai)}`}>
                    {getStatusIcon(item.TrangThai)}
                    <span>{item.TrangThai.toUpperCase()}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {item.NgayBaoCao ? new Date(item.NgayBaoCao).toLocaleDateString('vi-VN') : '-'}
                  </span>
                </div>
                
                {item.AnhSuCo && (
                  <div className="incident-images-wrapper">
                    {item.AnhSuCo.split(',').map((url, idx) => (
                      <div key={idx} className="incident-image-container">
                        <img 
                          src={url.startsWith('http') ? url : `${backendUrl}${url}`} 
                          alt={`Ảnh sự cố ${idx + 1}`} 
                          className="incident-image"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{ padding: '0 16px 16px 16px' }}>
                  <h3 className="incident-title" style={{ marginTop: 12 }}>{item.TenSuCo}</h3>
                  <p className="incident-desc">{item.MoTa}</p>
                  
                    <div className="incident-meta">
                      <div className="meta-item">
                        <HomeOutlined />
                        <span>Phòng {item.SoPhong}</span>
                      </div>
                      {item.NguoiXuLy && (
                        <div className="meta-item">
                          <UserOutlined />
                          <span>Xử lý bởi: <b>{item.NguoiXuLy}</b></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {item.TrangThai === 'Chờ duyệt' && (
                    <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                      <Button 
                        type="primary" 
                        ghost 
                        size="small" 
                        icon={<EditOutlined />} 
                        onClick={() => {
                          setEditingRecord(item); 
                          const imageUrls = item.AnhSuCo ? item.AnhSuCo.split(',') : [];
                          const formattedRecord = {
                            ...item,
                            AnhSuCo: imageUrls.map((url, idx) => ({
                              uid: `-${idx}`,
                              name: `image-${idx}.png`,
                              status: 'done',
                              url: url,
                              thumbUrl: url.startsWith('http') ? url : `${backendUrl}${url}`
                            }))
                          };
                          form.setFieldsValue(formattedRecord); 
                          setFileList(formattedRecord.AnhSuCo);
                          setModalOpen(true);
                        }}
                        style={{ flex: 1, borderRadius: 8 }}
                      >
                        Sửa
                      </Button>
                      <Popconfirm 
                        title="Xác nhận hủy báo cáo sự cố này?" 
                        onConfirm={() => handleDelete(item.MaSuCo)}
                        okText="Hủy báo cáo" 
                        cancelText="Quay lại"
                        okButtonProps={{ danger: true }}
                      >
                        <Button 
                          danger 
                          size="small" 
                          icon={<DeleteOutlined />} 
                          style={{ flex: 1, borderRadius: 8 }}
                        >
                          Hủy
                        </Button>
                      </Popconfirm>
                    </div>
                  )}
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div className="card" style={{ padding: '60px 0', textAlign: 'center' }}>
          <Empty description="Bạn chưa có báo cáo sự cố nào." />
          <Button type="primary" ghost icon={<PlusOutlined />} style={{ marginTop: 16 }} onClick={() => setModalOpen(true)}>
            Tạo báo cáo ngay
          </Button>
        </div>
      )}

      {/* Styles */}
      <style jsx global>{`
        .incident-card-premium {
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          overflow: hidden;
          border: 1px solid #f0f0f0;
        }
        .incident-images-wrapper {
          display: flex;
          overflow-x: auto;
          gap: 8px;
          padding: 8px;
          background: #f8f9fa;
        }
        .incident-images-wrapper::-webkit-scrollbar {
          height: 4px;
        }
        .incident-images-wrapper::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 4px;
        }
        .incident-image-container {
          flex: 0 0 200px;
          height: 150px;
          border-radius: 8px;
          overflow: hidden;
          background: #eee;
          position: relative;
        }
        .incident-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .incident-card-premium:hover .incident-image {
          transform: scale(1.1);
        }
        .incident-card-premium:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1);
        }
        .incident-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .incident-desc {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .incident-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .status-badge-modern {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          background: #f5f5f5;
        }
        .status-glow-orange { background: #fff7e6; color: #faad14; box-shadow: 0 0 10px rgba(250, 173, 20, 0.2); }
        .status-glow-blue { background: #e6f7ff; color: #1890ff; box-shadow: 0 0 10px rgba(24, 144, 255, 0.2); }
        .status-glow-green { background: #f6ffed; color: #52c41a; box-shadow: 0 0 10px rgba(82, 196, 26, 0.2); }
        
        .filter-chip {
          padding: 6px 16px;
          border-radius: 50px;
          border: 1px solid var(--border-color);
          background: #fff;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-chip.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          box-shadow: 0 4px 10px rgba(var(--primary-rgb), 0.3);
        }
        .hero-banner-modern {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          border-radius: 20px;
          padding: 30px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 8px 32px rgba(30, 60, 114, 0.25);
        }
        .btn-glass {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-glass:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );

  const AdminView = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}><WarningOutlined /> Quản lý Sự cố</Title>
        <Space>
          <Select allowClear placeholder="Lọc trạng thái" style={{ width: 180 }} onChange={setFilterTrangThai}
            options={[
              { label: 'Chờ duyệt', value: 'Chờ duyệt' },
              { label: 'Đang xử lý', value: 'Đang xử lý' },
              { label: 'Đã xử lý', value: 'Đã xử lý' },
            ]} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingRecord(null); form.resetFields(); setModalOpen(true); }}>
            Báo cáo sự cố
          </Button>
        </Space>
      </div>

      <div className="table-wrapper">
        <Table columns={columns} dataSource={filteredData} rowKey="MaSuCo" loading={loading} scroll={{ x: 1100 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} sự cố` }} />
      </div>
    </div>
  );

  return (
    <div>
      {isAdmin ? <AdminView /> : <ResidentView />}

      {/* Modal tạo/sửa sự cố */}
      <Modal title={editingRecord ? 'Sửa sự cố' : 'Báo cáo sự cố mới'} open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingRecord(null); form.resetFields(); }}
        onOk={() => form.submit()} okText={editingRecord ? 'Cập nhật' : 'Gửi báo cáo'} cancelText="Hủy">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="TenSuCo" label="Tên sự cố" rules={[{ required: true, message: 'Nhập tên sự cố' }]}>
            <Input placeholder="VD: Hỏng ống nước, Mất điện..." />
          </Form.Item>
          <Form.Item name="MoTa" label="Mô tả chi tiết" rules={[{ required: true, message: 'Nhập mô tả' }]}>
            <TextArea rows={3} placeholder="Mô tả chi tiết tình trạng sự cố" />
          </Form.Item>
          {isAdmin ? (
            <Form.Item name="MaPhong" label="Phòng">
              <Select allowClear placeholder="Chọn phòng"
                options={phongList.map(p => ({ label: `${p.SoPhong} - ${p.TenToaNha || ''}`, value: p.MaPhong }))} />
            </Form.Item>
          ) : (
            cuDanInfo?.MaPhong && (
              <Form.Item name="MaPhong" label="Phòng" initialValue={cuDanInfo.MaPhong} style={{ display: 'none' }}>
                <Input />
              </Form.Item>
            )
          )}
          <Form.Item 
            name="AnhSuCo" 
            label="Hình ảnh sự cố"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e?.fileList;
            }}
          >
            <Upload
              action={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload`}
              name="image"
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              onPreview={async (file) => {
                let src = file.url || file.thumbUrl;
                if (!src && file.originFileObj) {
                  src = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file.originFileObj);
                    reader.onload = () => resolve(reader.result);
                  });
                }
                const image = new Image();
                image.src = src;
                const imgWindow = window.open(src);
                imgWindow?.document.write(image.outerHTML);
              }}
              maxCount={5}
            >
              {fileList.length < 5 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xử lý sự cố */}
      <Modal title="Xử lý sự cố" open={xuLyModalOpen}
        onCancel={() => { setXuLyModalOpen(false); setEditingRecord(null); xuLyForm.resetFields(); }}
        onOk={() => xuLyForm.submit()} okText="Cập nhật" cancelText="Hủy">
        <Form form={xuLyForm} layout="vertical" onFinish={handleXuLy}>
          <Form.Item name="TrangThai" label="Trạng thái" rules={[{ required: true }]}>
            <Select options={[
              { label: 'Chờ duyệt', value: 'Chờ duyệt' },
              { label: 'Đang xử lý', value: 'Đang xử lý' },
              { label: 'Đã xử lý', value: 'Đã xử lý' },
            ]} />
          </Form.Item>
          <Form.Item name="NguoiXuLy" label="Người xử lý">
            <Input placeholder="Tên người xử lý" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
