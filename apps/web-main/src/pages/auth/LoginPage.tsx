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
  message,
  Space,
  Divider
} from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import authStore from '../../store/authStore';
import './AuthPage.css';

const { Title, Paragraph } = Typography;

const LoginPage: React.FC = observer(() => {
  const [form] = Form.useForm();
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 如果已经登录，跳转到首页
    if (authStore.isAuthenticated) {
      navigate('/');
    }
  }, [authStore.isAuthenticated, navigate]);

  const handleLogin = async (values: { username: string; password: string }) => {
    const success = await authStore.login(values.username, values.password);
    if (success) {
      message.success('登录成功');
      navigate('/');
    } else if (authStore.error) {
      message.error(authStore.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div
          className={`auth-card ${isHovering ? 'auth-card-hover' : ''}`}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            transform: isHovering ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)',
            boxShadow: isHovering ? '0 10px 25px rgba(0, 0, 0, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Card
            className="login-card"
            variant="borderless"
            cover={
              <div className="auth-logo-container">
                <Title level={2} className="auth-logo">XIANLINGLING</Title>
                <Paragraph className="auth-subtitle">登录您的账号</Paragraph>
              </div>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleLogin}
              initialValues={{
                username: '',
                password: '',
              }}
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
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
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
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

              <Form.Item className="auth-form-item">
                <Space orientation="horizontal" size="middle" className="auth-options">
                  <Checkbox className="auth-checkbox">记住我</Checkbox>
                  <Link to="/forgot-password" className="auth-link">
                    忘记密码？
                  </Link>
                </Space>
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
                  登录
                </Button>
              </Form.Item>

              <div className="auth-register">
                <Paragraph type="secondary">
                  还没有账号？
                  <Link to="/register" className="auth-link">
                    立即注册
                  </Link>
                </Paragraph>
              </div>
            </Form>

            <Divider className="auth-divider" />

            <div className="auth-agreement">
              <Paragraph type="secondary" className="agreement-text">
                登录即表示您同意我们的
                <Link to="/terms" className="auth-link">用户协议</Link>
                和
                <Link to="/privacy" className="auth-link">隐私政策</Link>
              </Paragraph>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
});

export default LoginPage;