import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Avatar, Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import authStore from '@/store/authStore';

// 定义导航项接口，支持嵌套结构
export interface NavItem {
  key: string;
  label: string;
  path?: string;
  children?: NavItem[];
}

// 导航配置数据
const navConfig: NavItem[] = [
  {
    key: 'home',
    label: '首页',
    path: '/',
  },
  {
    key: 'tools',
    label: '工具导航',
    children: [
      {
        key: 'ico',
        label: '图标',
        path: '/ico',
      },
      {
        key: 'image-cover',
        label: '图片封面',
        path: '/image-cover',
      },
      {
        key: 'redis',
        label: 'Redis管理',
        path: '/redis',
      },
    ],
  },
];

// 递归生成菜单配置
const generateMenuItems = (items: NavItem[]): MenuProps['items'] => {
  return items.map(item => ({
    key: item.path || item.key,
    label: item.path ? (
      <Link to={item.path}>{item.label}</Link>
    ) : (
      item.label
    ),
    children: item.children ? generateMenuItems(item.children) : undefined,
  }));
};

const NavMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 根据配置生成菜单项
  const menuItems = generateMenuItems(navConfig);

  // 处理退出登录
  const handleLogout = () => {
    authStore.logout();
    navigate('/login');
  };

  // 用户菜单配置
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      label: (
        <a onClick={(e) => {
          e.preventDefault();
          handleLogout();
        }}>
          <LogoutOutlined />
          退出登录
        </a>
      ),
    },
  ];

  // 渲染用户信息区域
  const renderUserArea = () => {
    if (authStore.isAuthenticated && authStore.userInfo) {
      return (
        <Dropdown
          menu={{
            items: userMenuItems,
          }}
          placement="bottomRight"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '0 16px', height: '40px' }}>
            <Avatar
              src={authStore.userInfo.avatar}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#87d068' }}
            />
            <span style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
              {authStore.userInfo.username}
            </span>
          </div>
        </Dropdown>
      );
    }

    // 未登录状态显示登录按钮
    return (
      <Button type="primary">
        <Link to="/login" style={{ color: '#fff' }}>登录</Link>
      </Button>
    );
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
      <Menu
        selectedKeys={[location.pathname]}
        mode="horizontal"
        items={menuItems}
        style={{ flex: 1 }}
      />
      <div style={{ marginLeft: '16px' }}>
        {renderUserArea()}
      </div>
    </div>
  );
};

export default NavMenu;