'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Popconfirm, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ToolOutlined } from '@ant-design/icons';
import dichVuService from '@/services/dichVuService';

const { Title } = Typography;

const loaiDVMap = { 1: 'Theo chỉ số', 2: 'Cố định' };
const loaiDVColors = { 1: 'blue', 2: 'green' };

export default function DichVuPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await dichVuService.getAll();
      setData(res.data?.data || []);
    } catch { message.error('Lỗi tải danh sách dịch vụ'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await dichVuService.update(editingRecord.MaDichVu, values);
        message.success('Cập nhật dịch vụ thành công');
      } else {
        await dichVuService.create(values);
        message.success('Thêm dịch vụ thành công');
      }
      setModalOpen(false); form.resetFields(); setEditingRecord(null);
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Thao tác thất bại'); }
  };

  const handleDelete = async (MaDichVu) => {
    try {
      await dichVuService.delete(MaDichVu);
      message.success('Xóa dịch vụ thành công');
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Xóa thất bại'); }
  };

  const columns = [
    { title: 'Mã DV', dataIndex: 'MaDichVu', key: 'MaDichVu', width: 140 },
    { title: 'Tên dịch vụ', dataIndex: 'TenDichVu', key: 'TenDichVu' },
    {
      title: 'Đơn giá', dataIndex: 'DonGia', key: 'DonGia', width: 150,
      render: (val) => val ? `${Number(val).toLocaleString('vi-VN')} đ` : '0 đ',
    },
    { title: 'Đơn vị tính', dataIndex: 'DonViTinh', key: 'DonViTinh', width: 120 },
    {
      title: 'Loại dịch vụ', dataIndex: 'LoaiDichVu', key: 'LoaiDichVu', width: 140,
      render: (val) => <Tag color={loaiDVColors[val] || 'default'}>{loaiDVMap[val] || val}</Tag>,
    },
    {
      title: 'Thao tác', key: 'actions', width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => {
            setEditingRecord(record); form.setFieldsValue(record); setModalOpen(true);
          }}>Sửa</Button>
          <Popconfirm title="Xác nhận xóa dịch vụ?" onConfirm={() => handleDelete(record.MaDichVu)} okText="Xóa" cancelText="Hủy">
            <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}><ToolOutlined /> Quản lý Dịch vụ</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingRecord(null); form.resetFields(); setModalOpen(true); }}>
          Thêm dịch vụ
        </Button>
      </div>

      <div className="table-wrapper">
        <Table columns={columns} dataSource={data} rowKey="MaDichVu" loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `Tổng ${t} dịch vụ` }} />
      </div>

      <Modal title={editingRecord ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'} open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingRecord(null); form.resetFields(); }}
        onOk={() => form.submit()} okText={editingRecord ? 'Cập nhật' : 'Thêm'} cancelText="Hủy">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="TenDichVu" label="Tên dịch vụ" rules={[{ required: true, message: 'Nhập tên dịch vụ' }]}>
            <Input placeholder="VD: Điện, Nước, Gửi xe..." />
          </Form.Item>
          <Form.Item name="DonGia" label="Đơn giá (VNĐ)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập đơn giá"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => v.replace(/\$\s?|(,*)/g, '')} />
          </Form.Item>
          <Form.Item name="DonViTinh" label="Đơn vị tính">
            <Input placeholder="VD: kWh, m³, xe/tháng..." />
          </Form.Item>
          <Form.Item name="LoaiDichVu" label="Loại dịch vụ" initialValue={1}>
            <Select options={[
              { label: 'Theo chỉ số (điện, nước)', value: 1 },
              { label: 'Cố định (gửi xe, rác...)', value: 2 },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
