import React from 'react';
import { Tabs, Card } from 'antd';
import Layout from '@/components/Layout';
import styles from './index.module.less';
import MemberLevelPage from './memberLevel';
import MemberInfoPage from './memberInfo';

const Members: React.FC = () => {
  // Tabs配置
  const tabsItems = [
    {
      key: 'memberLevels',
      label: '会员等级管理',
      children: <MemberLevelPage loading={false} />
    },
    {
      key: 'memberInfos',
      label: '会员信息管理',
      children: <MemberInfoPage loading={false} />
    }
  ];

  return (
    <Layout>
      <div className={styles.container}>
        <Card title="会员管理" variant="borderless">
          <Tabs items={tabsItems} />
        </Card>
      </div>
    </Layout>
  );
};

export default Members;
