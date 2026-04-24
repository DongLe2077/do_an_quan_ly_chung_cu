'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Typography, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, BankOutlined, ArrowUpOutlined } from '@ant-design/icons';
import useAuthStore from '@/store/authStore';
import nguoiDungService from '@/services/nguoiDungService';
import { App as AntdApp } from 'antd';

const { Title, Text, Link } = Typography;

export default function LoginPage() {
  const { message } = AntdApp.useApp();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await nguoiDungService.login(values);
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        message.success('Đăng nhập thành công!');
        router.push('/dashboard');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Đăng nhập thất bại!');
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
        {/* Overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(120deg, rgba(13,20,33,0.92) 0%, rgba(26,35,50,0.65) 50%, rgba(13,20,33,0.45) 100%)'
        }} />
        
        {/* Top Logo */}
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

        {/* Center Hero Text */}
        <div style={{ position: 'relative', zIndex: 1 }}>

          <Title level={1} style={{ color: 'white', fontSize: '3.6rem', fontWeight: 900, lineHeight: 1.1, marginBottom: 16, letterSpacing: '-1px' }}>
            Quản Lý <br /><span style={{ color: '#4a90d9' }}>Chung Cư</span>
          </Title>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 400, fontWeight: 400, lineHeight: 1.7 }}>
            Hệ thống quản lý thông minh kiến tạo không gian sống hiện đại và bền vững.
          </p>
        </div>

        {/* Bottom Stats */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 32, paddingBottom: 4 }}>
          {[{ num: '99%', label: 'Độ tin cậy' }, { num: '500+', label: 'Căn hộ' }].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>{s.num}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cột phải: Form Đăng nhập */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 sm:p-14" style={{ background: 'linear-gradient(135deg, #0d1421 0%, #1a2332 100%)' }}>
        <div className="w-full max-w-[400px]">
          {/* Glassmorphism card */}
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
              <Title level={2} style={{ fontWeight: 800, color: 'white', marginBottom: 8, fontSize: 28 }}>Đăng Nhập</Title>
              <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
                Chào mừng bạn trở lại hệ thống.
              </Text>
            </div>

            <Form name="login" onFinish={onFinish} layout="vertical" requiredMark={false}>
              <Form.Item
                label={<span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Tên đăng nhập</span>}
                name="TenDangNhap"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
              >
                <Input 
                  prefix={<UserOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />} 
                  placeholder="Nhập tên đăng nhập" 
                  size="large"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12,
                    color: 'white',
                    height: 50
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Mật khẩu</span>}
                name="MatKhau"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
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
                    height: 50
                  }}
                />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: -8 }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
                <Link style={{ fontSize: 13, color: '#4a90d9', fontWeight: 600 }}>Quên mật khẩu?</Link>
              </div>

              <Form.Item>
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
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>
          </div>

          {/* Footer credit */}
          <div style={{ textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
            © 2025 Elevate Admin &bull; Hệ thống quản lý chung cư thông minh
          </div>
        </div>
      </div>
    </div>
  );
}

// Dummy icon for checking, wait I shouldn't just use missing imports
function CheckCircleOutlined({className}) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
