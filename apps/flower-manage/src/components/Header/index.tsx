import React from 'react';
import { Layout, Avatar, Dropdown, Select, message } from 'antd';
import type { MenuProps } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authStore from '@/store/authStore';
import i18n from '@/i18n';
import styles from './index.module.less';
import { storage } from '@/utils/storage';
import type { User } from '@/types/user';

const { Header } = Layout;
const { Option } = Select;

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = authStore;
  const userInfo = storage.get<User>('userInfo');
  console.log(userInfo);
  // 退出登录处理
  const handleLogout = () => {
    logout();
    message.success('退出登录成功');
    setTimeout(() => {
      navigate('/login');
    }, 30)
  };

  // 语言切换处理
  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem('language', value);
  };

  // 下拉菜单配置
  const menuProps: MenuProps = {
    items: [
      {
        key: 'logout',
        label: '退出登录',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  };

  // 默认用户信息
  const defaultUserInfo = {
    username: '游客',
    avatar: '',
  };

  const currentUserInfo = userInfo || defaultUserInfo;

  return (
    <Header className={styles["app-header"]}>
      <div className={styles["app-header-content"]}>
        <div className={styles["app-title"]}>鲜花管理系统 - 后台管理</div>

        <div className={styles["app-header-right"]}>
          {/* 语言切换 */}
          <Select
            defaultValue={localStorage.getItem('language') || 'zh-CN'}
            style={{ width: 120, marginRight: 20 }}
            onChange={handleLanguageChange}
            className={styles["language-select"]}
          >
            <Option value="zh-CN">中文</Option>
            <Option value="en-US">English</Option>
          </Select>

          <div className={styles["app-user-info"]}>
            <span className={styles["user-name"]}>{currentUserInfo.username}</span>
            <Dropdown menu={menuProps} trigger={['click']}>
              <Avatar
                src={userInfo?.avatar}
                size={40}
                className={styles["user-avatar"]}
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          </div>
        </div>
      </div>
    </Header>
  );
};

export default AppHeader;