import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import {
  Card,
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  message
} from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import authStore from '@/store/authStore';
import './AuthPage.css';

const { Title, Paragraph } = Typography;

const RegisterPage: React.FC = observer(() => {
  const [form] = Form.useForm();
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 如果已经登录，跳转到首页
    if (authStore.isAuthenticated) {
      navigate('/');
    }
  }, [authStore.isAuthenticated, navigate]);

  const handleRegister = async (values: { username: string; email: string; password: string }) => {
    const success = await authStore.register(values.username, values.email, values.password);
    if (success) {
      message.success('注册成功，请登录');
      navigate('/login');
    } else if (authStore.error) {
      message.error(authStore.error);
    }
  };

  // 验证两次密码是否一致
  const validateConfirmPassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('请确认密码'));
    }
    if (form.getFieldValue('password') !== value) {
      return Promise.reject(new Error('两次输入的密码不一致'));
    }
    return Promise.resolve();
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div
          className={`auth-card ${isHovered ? 'auth-card-hover' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            transform: isHovered ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
            boxShadow: isHovered ? '0 10px 25px rgba(0, 0, 0, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Card
            className="register-card"
            variant="borderless"
            cover={
              <div className="auth-logo-container">
                <Title level={2} className="auth-logo">XIANLINGLING</Title>
                <Paragraph className="auth-subtitle">创建您的账号</Paragraph>
              </div>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleRegister}
              initialValues={{
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                agree: false
              }}
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                  { max: 20, message: '用户名最多20个字符' }
                ]}
                className="auth-form-item"
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="请输入用户名"
                  className="auth-input"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
                className="auth-form-item"
              >
                <Input
                  prefix={<MailOutlined className="site-form-item-icon" />}
                  placeholder="请输入邮箱"
                  className="auth-input"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' },
                  { pattern: /^(?=.*[a-zA-Z])(?=.*\d)/, message: '密码必须包含字母和数字' }
                ]}
                className="auth-form-item"
              >
                <Input
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="请输入密码"
                  className="auth-input"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['password']}
                rules={[{ required: true, validator: validateConfirmPassword }]}
                className="auth-form-item"
              >
                <Input
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type="password"
                  placeholder="请确认密码"
                  className="auth-input"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="agree"
                valuePropName="checked"
                rules={[{ required: true, message: '请阅读并同意用户协议和隐私政策' }]}
                className="auth-form-item"
              >
                <Checkbox className="auth-checkbox">
                  我已阅读并同意
                  <Link to="/terms" className="auth-link">用户协议</Link>
                  和
                  <Link to="/privacy" className="auth-link">隐私政策</Link>
                </Checkbox>
              </Form.Item>

              <Form.Item className="auth-form-item">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="auth-button"
                  size="large"
                  loading={authStore.loading}
                  block
                >
                  注册
                </Button>
              </Form.Item>

              <div className="auth-login">
                <Paragraph type="secondary">
                  已有账号？
                  <Link to="/login" className="auth-link">
                    立即登录
                  </Link>
                </Paragraph>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
});

export default RegisterPage;