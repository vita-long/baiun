import React from 'react';
import { Layout as AntLayout } from 'antd';
import SideMenu from '@/components/SideMenu';
import styles from './index.module.less';

const { Content, Sider } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

  return (
    <AntLayout className={styles.layout}>
      <Sider width={256} theme="light" className={styles.sider}>
        <SideMenu />
      </Sider>
      <Content className={styles.content}>
        {children}
      </Content>
    </AntLayout>
  );
};

export default Layout;