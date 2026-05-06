'use client';

import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Descriptions, Tag, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import useAuthStore from '@/store/authStore';
import userService from '@/services/userService';

const { Title, Text } = Typography;
const roleLabels = { admin: 'Ban quản lý', cudan: 'Cư dân', kythuat: 'Kỹ thuật', user: 'Người dùng' };
const roleColors = { admin: 'red', cudan: 'blue', kythuat: 'orange', user: 'default' };

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => { if (user) fetchProfile(); }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await userService.getProfile();
      setProfile(res.data?.data);
    } catch {}
  };

  const handleChangePassword = async (values) => {
    if (values.new_password !== values.confirm_password) {
      return message.error('Mật khẩu xác nhận không khớp!');
    }
    setLoading(true);
    try {
      await userService.changePassword(user.user_id, {
        old_password: values.old_password,
        new_password: values.new_password,
      });
      message.success('Đổi mật khẩu thành công!');
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại!');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}><UserOutlined /> Thông tin cá nhân</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Thông tin tài khoản" style={{ borderRadius: 12 }}>
            <Descriptions column={1} labelStyle={{ fontWeight: 500 }}>
              <Descriptions.Item label="Mã người dùng">{profile?.user_id || user?.user_id}</Descriptions.Item>
              <Descriptions.Item label="Tên đăng nhập">{profile?.username || user?.username}</Descriptions.Item>
              <Descriptions.Item label="Email">{profile?.email || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag color={roleColors[profile?.role || user?.role]}>
                  {roleLabels[profile?.role || user?.role] || (profile?.role || user?.role)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={(profile?.status || '') === 'Hoạt động' ? 'green' : 'red'}>
                  {profile?.status || 'N/A'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={<><LockOutlined /> Đổi mật khẩu</>} style={{ borderRadius: 12 }}>
            <Form form={form} layout="vertical" onFinish={handleChangePassword}>
              <Form.Item name="old_password" label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Nhập mật khẩu hiện tại' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" />
              </Form.Item>
              <Form.Item name="new_password" label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Nhập mật khẩu mới' },
                  { min: 6, message: 'Mật khẩu mới ít nhất 6 ký tự' },
                ]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
              </Form.Item>
              <Form.Item name="confirm_password" label="Xác nhận mật khẩu mới"
                rules={[{ required: true, message: 'Xác nhận mật khẩu mới' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block
                  style={{ height: 40, borderRadius: 8, fontWeight: 600 }}>
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
