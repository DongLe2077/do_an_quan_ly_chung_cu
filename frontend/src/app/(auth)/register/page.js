'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Typography, Checkbox } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import userService from '@/services/userService';
import { App as AntdApp } from 'antd';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const { message } = AntdApp.useApp();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await userService.register({
        email: values.email,
        password: values.password,
        full_name: values.full_name,
        phone: values.phone,
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
    <div className="min-h-screen flex w-full page-fade-in" style={{ background: '#0d1421' }}>
      {/* Cột trái: Hình ảnh (Hero Section) */}
      <div 
        className="hidden lg:flex lg:w-[60%] flex-col justify-between p-12 text-white relative"
        style={{
          backgroundImage: 'url("/bg-login.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(120deg, rgba(13,20,33,0.92) 0%, rgba(26,35,50,0.65) 50%, rgba(13,20,33,0.45) 100%)'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(74,144,217,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.3)' }} />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 16, letterSpacing: '0.5px' }}>ELEVATE ADMIN</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase' }}>Management System</div>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Title level={1} style={{ color: 'white', fontSize: '3.6rem', fontWeight: 900, lineHeight: 1.1, marginBottom: 16, letterSpacing: '-1px' }}>
            Tham Gia <br /><span style={{ color: '#4a90d9' }}>Cộng Đồng</span>
          </Title>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 400, fontWeight: 400, lineHeight: 1.7 }}>
            Tạo tài khoản để trải nghiệm các tiện ích hiện đại của hệ thống quản lý chung cư.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 32, paddingBottom: 4 }}>
          {[{ num: '99%', label: 'Độ tin cậy' }, { num: '500+', label: 'Căn hộ' }].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>{s.num}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cột phải: Form Đăng ký */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 sm:p-14" style={{ background: 'linear-gradient(135deg, #0d1421 0%, #1a2332 100%)' }}>
        <div className="w-full max-w-[420px] overflow-y-auto max-h-screen py-8 scrollbar-hide">
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24,
            padding: '40px 36px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(74,144,217,0.08)'
          }}>
            <div style={{ marginBottom: 32 }}>
              <Title level={2} style={{ fontWeight: 800, color: 'white', marginBottom: 8, fontSize: 28 }}>Đăng Ký</Title>
              <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
                Tạo tài khoản mới cho cư dân.
              </Text>
            </div>

            <Form form={form} name="register" onFinish={onFinish} layout="vertical" requiredMark={false}>
              
              <Form.Item
                label={<span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Email</span>}
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />} 
                  placeholder="Nhập địa chỉ email" 
                  size="large"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12,
                    color: 'white',
                    height: 48
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Mật khẩu</span>}
                name="password"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }, { min: 6, message: 'Mật khẩu phải từ 6 ký tự!' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />} 
                  placeholder="••••••••" 
                  size="large"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12,
                    color: 'white',
                    height: 48
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Xác nhận mật khẩu</span>}
                name="confirm_password"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />} 
                  placeholder="••••••••" 
                  size="large"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12,
                    color: 'white',
                    height: 48
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Họ và tên</span>}
                name="full_name"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />} 
                  placeholder="Ví dụ: Nguyễn Văn A" 
                  size="large"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12,
                    color: 'white',
                    height: 48
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Điện thoại</span>}
                name="phone"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input 
                  prefix={<span style={{ color: 'rgba(255,255,255,0.4)', marginRight: 4, display: 'flex', alignItems: 'center' }}><PhoneOutlined style={{marginRight: 4}}/> +84 |</span>} 
                  placeholder="Nhập số điện thoại" 
                  size="large"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12,
                    color: 'white',
                    height: 48
                  }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 16, marginTop: 8 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading} 
                  block
                  size="large"
                  style={{
                    height: 52,
                    background: 'linear-gradient(135deg, #5ba0e8, #4a90d9)',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 20px rgba(74,144,217,0.4)'
                  }}
                >
                  Đăng ký
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                Bạn đã có tài khoản? <span onClick={() => router.push('/login')} style={{ cursor: 'pointer', color: '#4a90d9', fontWeight: 600 }}>Đăng nhập</span>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
