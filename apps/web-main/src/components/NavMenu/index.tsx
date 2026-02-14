import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Image } from 'antd';
import type { MenuProps } from 'antd';
import HeaderIcon from '@/assets/ling.jpg';

export interface NavItem {
  key: string;
  label: string;
  path?: string;
  children?: NavItem[];
}

const navConfig: NavItem[] = [
  {
    key: 'home',
    label: '首页',
    path: '/',
  },
  {
    key: 'tools',
    label: '工具类',
  },
  {
    key: 'ainimation',
    label: '动画',
  },
];

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

  const menuItems = generateMenuItems(navConfig);

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="w-[32px] h-[32px] mx-4">
        <Image src={HeaderIcon} width={32} height={32} alt="logo" />
      </div>
      <Menu
        selectedKeys={[location.pathname]}
        mode="horizontal"
        items={menuItems}
        style={{ flex: 1 }}
      />
    </div>
  );
};

export default NavMenu;