import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Upload, message, Tabs, Space } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import type { UploadProps } from 'antd';
import Layout from '@/components/Layout';
import styles from './index.module.less';
import {
  getCurrentUser,
  updateUserProfile,
  updatePassword,
  uploadAvatar,
  type UpdateUserProfileDto,
  type UpdatePasswordDto
} from '@/service/user';
import type { User } from '@/types/user';
import { storage } from '@/utils/storage';

/**
 * 个人中心管理组件
 */
const Profile: React.FC = () => {
  // 表单实例
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // 当前用户信息
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Tabs配置
  const [activeTabKey, setActiveTabKey] = useState('profile');

  // 获取当前用户信息
  const {
    run: fetchCurrentUser,
    loading: userLoading
  } = useRequest(getCurrentUser, {
    onSuccess: (data) => {
      setCurrentUser(data);
      profileForm.setFieldsValue(data);
      storage.set('userInfo', data);
    },
    onError: () => {
      message.error('获取用户信息失败');
    }
  });

  // 更新用户信息
  const {
    run: updateProfile,
    loading: updateLoading
  } = useRequest(updateUserProfile, {
    manual: true,
    onSuccess: () => {
      message.success('个人信息更新成功');
      fetchCurrentUser();
    },
    onError: () => {
      message.error('个人信息更新失败');
    }
  });

  // 更新密码
  const {
    run: updateUserPassword,
    loading: passwordLoading
  } = useRequest(updatePassword, {
    manual: true,
    onSuccess: () => {
      message.success('密码更新成功');
      passwordForm.resetFields();
    },
    onError: () => {
      message.error('密码更新失败');
    }
  });

  // 上传头像
  const {
    run: uploadUserAvatar,
    loading: avatarLoading
  } = useRequest(uploadAvatar, {
    manual: true,
    onSuccess: (data) => {
      message.success('头像上传成功');
      // 更新头像URL到用户信息
      updateProfile({ avatar: data.url });
    },
    onError: () => {
      message.error('头像上传失败');
    }
  });

  // 组件加载时获取用户信息
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // 处理个人信息提交
  const handleProfileSubmit = () => {
    profileForm.validateFields().then((values) => {
      const updateData: UpdateUserProfileDto = {
        username: values.username,
        email: values.email,
        phone: values.phone,
        bio: values.bio
      };
      updateProfile(updateData);
    }).catch((errorInfo) => {
      console.log('表单验证失败:', errorInfo);
    });
  };

  // 处理密码提交
  const handlePasswordSubmit = () => {
    passwordForm.validateFields().then((values) => {
      if (values.newPassword !== values.confirmPassword) {
        message.error('新密码和确认密码不一致');
        return;
      }

      const updateData: UpdatePasswordDto = {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      };
      updateUserPassword(updateData);
    }).catch((errorInfo) => {
      console.log('表单验证失败:', errorInfo);
    });
  };

  // 上传头像配置
  const uploadProps: UploadProps = {
    name: 'avatar',
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('请上传图片文件');
        return false;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过2MB');
        return false;
      }

      uploadUserAvatar(file);
      return false;
    },
    showUploadList: false
  };

  return (
    <Layout>
      <Card title="个人中心">
        <div className={styles.container}>
          <div className={styles.contentWrapper}>
            {/* 个人信息卡片 */}
            <Card className={styles.profileCard} loading={userLoading}>
              <div className={styles.profileHeader}>
                <Avatar
                  size={100}
                  icon={<UserOutlined />}
                  src={currentUser?.avatar}
                  className={styles.avatar}
                />

                <div className={styles.uploadButton}>
                  <Upload {...uploadProps}>
                    <Button
                      icon={<UploadOutlined />}
                      loading={avatarLoading}
                    >
                      更换头像
                    </Button>
                  </Upload>
                </div>

                <div className={styles.userInfo}>
                  <h3>{currentUser?.username}</h3>
                  <p className={styles.email}>{currentUser?.email}</p>
                </div>
              </div>
            </Card>

            {/* 编辑区域 */}
            <Tabs
              activeKey={activeTabKey}
              onChange={setActiveTabKey}
              className={styles.editTabs}
              items={[
                {
                  key: 'profile',
                  label: '个人信息',
                  children: (
                    <Card>
                      <Form
                        form={profileForm}
                        layout="vertical"
                        onFinish={handleProfileSubmit}
                      >
                        <Form.Item
                          name="username"
                          label="用户名"
                          rules={[{ required: true, message: '请输入用户名' }]}
                        >
                          <Input placeholder="请输入用户名" />
                        </Form.Item>

                        <Form.Item
                          name="email"
                          label="邮箱"
                          rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' }
                          ]}
                        >
                          <Input placeholder="请输入邮箱" />
                        </Form.Item>

                        <Form.Item
                          name="phone"
                          label="手机号"
                          rules={[{ required: true, message: '请输入手机号' }]}
                        >
                          <Input placeholder="请输入手机号" />
                        </Form.Item>

                        <Form.Item
                          name="bio"
                          label="个人简介"
                        >
                          <Input.TextArea
                            rows={4}
                            placeholder="请输入个人简介"
                          />
                        </Form.Item>

                        <Form.Item>
                          <Space>
                            <Button type="primary" htmlType="submit" loading={updateLoading}>
                              保存修改
                            </Button>
                            <Button onClick={() => profileForm.resetFields()}>重置</Button>
                          </Space>
                        </Form.Item>
                      </Form>
                    </Card>
                  ),
                },
                {
                  key: 'password',
                  label: '密码修改',
                  children: (
                    <Card>
                      <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handlePasswordSubmit}
                      >
                        <Form.Item
                          name="oldPassword"
                          label="旧密码"
                          rules={[{ required: true, message: '请输入旧密码' }]}
                        >
                          <Input.Password placeholder="请输入旧密码" />
                        </Form.Item>

                        <Form.Item
                          name="newPassword"
                          label="新密码"
                          rules={[
                            { required: true, message: '请输入新密码' },
                            { min: 6, message: '密码长度不能少于6位' }
                          ]}
                        >
                          <Input.Password placeholder="请输入新密码" />
                        </Form.Item>

                        <Form.Item
                          name="confirmPassword"
                          label="确认新密码"
                          rules={[
                            { required: true, message: '请确认新密码' },
                            ({
                              getFieldValue
                            }) => ({
                              validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(new Error('两次输入的密码不一致'));
                              },
                            }),
                          ]}
                        >
                          <Input.Password placeholder="请确认新密码" />
                        </Form.Item>

                        <Form.Item>
                          <Space>
                            <Button type="primary" htmlType="submit" loading={passwordLoading}>
                              修改密码
                            </Button>
                            <Button onClick={() => passwordForm.resetFields()}>重置</Button>
                          </Space>
                        </Form.Item>
                      </Form>
                    </Card>
                  ),
                },
              ]}
            ></Tabs>
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default Profile;
