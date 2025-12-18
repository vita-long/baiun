import React from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { AppstoreOutlined, ShoppingOutlined, DatabaseOutlined, FileTextOutlined, CreditCardOutlined, DatabaseOutlined as InventoryOutlined, UserOutlined, GiftOutlined, BarChartOutlined, GiftOutlined as CouponOutlined } from '@ant-design/icons';
import styles from './index.module.less';

const SideMenu: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // 计算当前路径的所有父级路径，用于展开菜单
  const getParentKeys = (path: string) => {
    const keys: string[] = [];
    const pathSegments = path.split('/').filter(Boolean);

    if (pathSegments.length > 1) {
      let parentPath = '';
      for (let i = 0; i < pathSegments.length - 1; i++) {
        parentPath += `/${pathSegments[i]}`;
        keys.push(parentPath);
      }
    }

    return keys;
  };

  // 初始openKeys为当前路径的父级路径
  const [openKeys, setOpenKeys] = React.useState<string[]>(getParentKeys(currentPath));

  // 处理菜单展开/折叠事件
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  // 当路径变化时，确保相关的父菜单保持展开
  React.useEffect(() => {
    const parentKeys = getParentKeys(currentPath);
    setOpenKeys(prevKeys => {
      // 合并当前路径的父级路径和用户手动展开的路径
      const newKeys = new Set([...prevKeys, ...parentKeys]);
      return Array.from(newKeys);
    });
  }, [currentPath]);

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
      key: '/mall',
      label: <Link to="/mall">积分商城管理</Link>,
      icon: <GiftOutlined />,
    },
    {
      key: '/marketing',
      label: '营销管理',
      icon: <BarChartOutlined />,
      children: [
        {
          key: '/marketing/coupons',
          label: <Link to="/marketing/coupons">优惠卷管理</Link>,
          icon: <CouponOutlined />,
        },
      ],
    },
    {
      key: '/orders',
      label: <Link to="/orders">订单管理</Link>,
      icon: <FileTextOutlined />,
    },
    {
      key: '/payment-methods',
      label: <Link to="/payment-methods">支付方式管理</Link>,
      icon: <CreditCardOutlined />,
    },
    {
      key: '/stock-management',
      label: <Link to="/stock-management">库存管理</Link>,
      icon: <InventoryOutlined />,
    },
    {
      key: '/members',
      label: <Link to="/members">会员管理</Link>,
      icon: <UserOutlined />,
    },
    {
      key: '/profile',
      label: <Link to="/profile">个人中心</Link>,
      icon: <UserOutlined />,
    },
  ];

  return (
    <div className={styles.sideMenu}>
      <Menu
        mode="inline"
        selectedKeys={[currentPath]}
        openKeys={openKeys}
        onOpenChange={handleOpenChange}
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