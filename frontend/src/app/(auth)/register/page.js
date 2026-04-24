'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, BankOutlined } from '@ant-design/icons';
import nguoiDungService from '@/services/nguoiDungService';

const { Title, Text, Link } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values) => {
    if (values.MatKhau !== values.XacNhanMatKhau) {
      return message.error('Mật khẩu xác nhận không khớp!');
    }
    setLoading(true);
    try {
      const res = await nguoiDungService.register({
        TenDangNhap: values.TenDangNhap,
        MatKhau: values.MatKhau,
        Email: values.Email,
      });
      if (res.data.success) {
        message.success('Đăng ký thành công! Vui lòng đăng nhập.');
        router.push('/login');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <Card
        style={{
          width: 420,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: 'none',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #1677ff, #0052d9)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <BankOutlined style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <Title level={3} style={{ marginBottom: 4 }}>Tạo tài khoản mới</Title>
          <Text type="secondary">Đăng ký để sử dụng hệ thống</Text>
        </div>

        <Form name="register" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="TenDangNhap"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="Email"
            rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email (tùy chọn)" />
          </Form.Item>

          <Form.Item
            name="MatKhau"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item
            name="XacNhanMatKhau"
            rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block
              style={{
                height: 44,
                background: 'linear-gradient(135deg, #1677ff, #0052d9)',
                borderRadius: 8,
                fontWeight: 600,
              }}>
              Đăng ký
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">Đã có tài khoản? </Text>
            <Link onClick={() => router.push('/login')}>Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
