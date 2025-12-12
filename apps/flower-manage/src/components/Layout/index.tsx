import React from 'react';
import { Layout as AntLayout, Select, Button, Flex } from 'antd';
import { useTranslation } from 'react-i18next';
import SideMenu from '@/components/SideMenu';
import styles from './index.module.less';

const { Content, Sider } = AntLayout;
const { Option } = Select;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation();

  // 语言切换处理函数
  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem('language', value);
  };

  return (
    <AntLayout className={styles.layout}>
      <Sider width={256} theme="light" className={styles.sider}>
        <SideMenu />
      </Sider>
      <Content className={styles.content}>
        {/* 语言切换按钮 */}
        <Flex justify="flex-end" style={{ padding: '16px' }}>
          <Select
            value={i18n.language}
            onChange={handleLanguageChange}
            style={{ width: 120 }}
          >
            <Option value="zh-CN">中文</Option>
            <Option value="en-US">English</Option>
          </Select>
        </Flex>
        {children}
      </Content>
    </AntLayout>
  );
};

export default Layout;