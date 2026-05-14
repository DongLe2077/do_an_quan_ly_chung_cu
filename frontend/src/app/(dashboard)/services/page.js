'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Popconfirm, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ToolOutlined } from '@ant-design/icons';
import serviceService from '@/services/serviceService';

const { Title } = Typography;

const loaiDVMap = { 1: 'Theo chỉ số', 2: 'Cố định' };
const loaiDVColors = { 1: 'blue', 2: 'green' };

export default function DichVuPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;
  const [form] = Form.useForm();

  useEffect(() => { fetchData(); }, [currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await serviceService.getAll({ page: currentPage, limit: pageSize });
      if (res.data?.pagination) {
        setData(res.data.data || []);
        setTotalItems(res.data.pagination.total);
      } else {
        setData(res.data?.data || []);
        setTotalItems((res.data?.data || []).length);
      }
    } catch { message.error('Lỗi tải danh sách dịch vụ'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await serviceService.update(editingRecord.service_id, values);
        message.success('Cập nhật dịch vụ thành công');
      } else {
        await serviceService.create(values);
        message.success('Thêm dịch vụ thành công');
      }
      setModalOpen(false); form.resetFields(); setEditingRecord(null);
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Thao tác thất bại'); }
  };

  const handleDelete = async (serviceId) => {
    try {
      await serviceService.delete(serviceId);
      message.success('Xóa dịch vụ thành công');
      fetchData();
    } catch (error) { message.error(error.response?.data?.message || 'Xóa thất bại'); }
  };

  const columns = [
    { title: 'Mã DV', dataIndex: 'service_id', key: 'service_id', width: 140 },
    { title: 'Tên dịch vụ', dataIndex: 'service_name', key: 'service_name' },
    {
      title: 'Đơn giá', dataIndex: 'unit_price', key: 'unit_price', width: 150,
      render: (val) => val ? `${Number(val).toLocaleString('vi-VN')} đ` : '0 đ',
    },
    { title: 'Đơn vị tính', dataIndex: 'unit', key: 'unit', width: 120 },
    {
      title: 'Loại dịch vụ', dataIndex: 'service_type', key: 'service_type', width: 140,
      render: (val) => <Tag color={loaiDVColors[val] || 'default'}>{loaiDVMap[val] || val}</Tag>,
    },
    {
      title: 'Thao tác', key: 'actions', width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => {
            setEditingRecord(record); form.setFieldsValue(record); setModalOpen(true);
          }}>Sửa</Button>
          <Popconfirm title="Xác nhận xóa dịch vụ?" onConfirm={() => handleDelete(record.service_id)} okText="Xóa" cancelText="Hủy">
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
        <Table columns={columns} dataSource={data} rowKey="service_id" loading={loading}
          pagination={{ 
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            showSizeChanger: false, 
            showTotal: (t) => `Tổng ${t} dịch vụ` 
          }}
          onChange={(pagination) => setCurrentPage(pagination.current)}
        />
      </div>

      <Modal title={editingRecord ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'} open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingRecord(null); form.resetFields(); }}
        onOk={() => form.submit()} okText={editingRecord ? 'Cập nhật' : 'Thêm'} cancelText="Hủy">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="service_name" label="Tên dịch vụ" rules={[{ required: true, message: 'Nhập tên dịch vụ' }]}>
            <Input placeholder="VD: Điện, Nước, Gửi xe..." />
          </Form.Item>
          <Form.Item name="unit_price" label="Đơn giá (VNĐ)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập đơn giá"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => v.replace(/\$\s?|(,*)/g, '')} />
          </Form.Item>
          <Form.Item name="unit" label="Đơn vị tính">
            <Input placeholder="VD: kWh, m³, xe/tháng..." />
          </Form.Item>
          <Form.Item name="service_type" label="Loại dịch vụ" initialValue={1}>
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
