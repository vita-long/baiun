import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Divider,
  Space
} from 'antd';
import { MailOutlined, LockOutlined, ReloadOutlined } from '@ant-design/icons';
import authStore from '../../store/authStore';
import './AuthPage.css';

const { Title, Paragraph } = Typography;

const ForgotPasswordPage: React.FC = observer(() => {
  const [form] = Form.useForm();
  const [isHovered, setIsHovered] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState(1); // 1: 输入邮箱, 2: 输入验证码和新密码
  const navigate = useNavigate();

  useEffect(() => {
    // 如果已经登录，跳转到首页
    if (authStore.isAuthenticated) {
      navigate('/');
    }
  }, [authStore.isAuthenticated, navigate]);

  // 处理倒计时
  useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // 发送验证码
  const handleSendCode = async () => {
    const email = form.getFieldValue('email');
    if (!email) {
      message.error('请输入邮箱');
      return;
    }

    const success = await authStore.sendVerificationCode(email);
    if (success) {
      message.success('验证码已发送');
      setCountdown(60);
      setStep(2);
    } else if (authStore.error) {
      message.error(authStore.error);
    }
  };

  // 重置密码
  const handleResetPassword = async (values: { email: string; code: string; newPassword: string; confirmPassword: string }) => {
    const success = await authStore.resetPassword(values.email, values.code, values.newPassword);
    if (success) {
      message.success('密码重置成功，请登录');
      navigate('/login');
    } else if (authStore.error) {
      message.error(authStore.error);
    }
  };

  // 返回第一步
  const handleBack = () => {
    setStep(1);
    form.setFieldsValue({ code: '', newPassword: '', confirmPassword: '' });
  };

  // 验证两次密码是否一致
  const validateConfirmPassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('请确认密码'));
    }
    if (form.getFieldValue('newPassword') !== value) {
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
            className="forgot-card"
            bordered={false}
            cover={
              <div className="auth-logo-container">
                <Title level={2} className="auth-logo">XIANLINGLING</Title>
                <Paragraph className="auth-subtitle">
                  {step === 1 ? '找回密码' : '重置密码'}
                </Paragraph>
              </div>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={step === 1 ? handleSendCode : handleResetPassword}
              initialValues={{
                email: '',
                code: '',
                newPassword: '',
                confirmPassword: ''
              }}
            >
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
                  placeholder="请输入注册时的邮箱"
                  className="auth-input"
                  size="large"
                  disabled={step === 2}
                />
              </Form.Item>

              {step === 2 && (
                <>
                  <Form.Item
                    name="code"
                    label="验证码"
                    rules={[{ required: true, message: '请输入验证码' }]}
                    className="auth-form-item"
                  >
                    <Space className="verification-code-container" align="baseline">
                      <Input
                        prefix={<ReloadOutlined className="site-form-item-icon" />}
                        placeholder="请输入验证码"
                        className="auth-input verification-code-input"
                        size="large"
                      />
                      <Button
                        type="link"
                        className="send-code-button"
                        disabled={countdown > 0}
                        onClick={handleSendCode}
                      >
                        {countdown > 0 ? `${countdown}秒后重发` : '重新发送'}
                      </Button>
                    </Space>
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label="新密码"
                    rules={[
                      { required: true, message: '请输入新密码' },
                      { min: 6, message: '密码至少6个字符' },
                      { pattern: /^(?=.*[a-zA-Z])(?=.*\d)/, message: '密码必须包含字母和数字' }
                    ]}
                    className="auth-form-item"
                  >
                    <Input
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      type="password"
                      placeholder="请输入新密码"
                      className="auth-input"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="确认新密码"
                    dependencies={['newPassword']}
                    rules={[{ required: true, validator: validateConfirmPassword }]}
                    className="auth-form-item"
                  >
                    <Input
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      type="password"
                      placeholder="请确认新密码"
                      className="auth-input"
                      size="large"
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item className="auth-form-item">
                <Space orientation="vertical" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="auth-button"
                    size="large"
                    loading={authStore.loading}
                    block
                  >
                    {step === 1 ? '发送验证码' : '重置密码'}
                  </Button>

                  {step === 2 && (
                    <Button
                      type="default"
                      className="auth-button-secondary"
                      size="large"
                      onClick={handleBack}
                      block
                    >
                      返回修改邮箱
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Form>

            <Divider className="auth-divider" />

            <div className="auth-login">
              <Paragraph type="secondary">
                想起密码了？
                <Link to="/login" className="auth-link">
                  立即登录
                </Link>
              </Paragraph>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
});

export default ForgotPasswordPage;