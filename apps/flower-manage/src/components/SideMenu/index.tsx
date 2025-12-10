import React from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { AppstoreOutlined, ShoppingOutlined, DatabaseOutlined, FileTextOutlined } from '@ant-design/icons';
import styles from './index.module.less';

const SideMenu: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    {
      key: '/',
      label: <Link to="/">首页</Link>,
      icon: <AppstoreOutlined />,
    },
    {
      key: '/categories',
      label: <Link to="/categories">分类管理</Link>,
      icon: <DatabaseOutlined />,
    },
    {
      key: '/products',
      label: <Link to="/products">商品管理</Link>,
      icon: <ShoppingOutlined />,
    },
    {
      key: '/orders',
      label: <Link to="/orders">订单管理</Link>,
      icon: <FileTextOutlined />,
    },
  ];

  return (
    <div className={styles.sideMenu}>
      <Menu
        mode="inline"
        selectedKeys={[currentPath]}
        items={menuItems}
        className={styles.menu}
        onClick={() => {
          // 导航已通过Link组件处理
        }}
      />
    </div>
  );
};

export default SideMenu;