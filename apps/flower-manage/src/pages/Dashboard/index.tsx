
import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { AppstoreOutlined, ShoppingOutlined, DatabaseOutlined } from '@ant-design/icons';
import Layout from '@/components/Layout';
import styles from './index.module.less';

import { Button } from '@baiun/component-ant';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  // 首页统计数据
  const statistics = [
    {
      title: t('pages.Dashboard.index_0'),
      value: 15,
      icon: <AppstoreOutlined />,
      color: '#1890ff',
      link: '/categories',
    },
    {
      title: t('pages.Dashboard.index_1'),
      value: 280,
      icon: <ShoppingOutlined />,
      color: '#52c41a',
      link: '/products',
    },
    {
      title: t('pages.Dashboard.index_2'),
      value: '1.2GB',
      icon: <DatabaseOutlined />,
      color: '#faad14',
      link: '',
    },
  ];

  return (
    <Layout>
      <div className={styles.contentWrapper}>
        <div className={styles.contentHeader}>
          <h2>{t('pages.Dashboard.index_3')}</h2>
          <Button type="primary">{t('pages.Dashboard.index_4')}</Button>
        </div>

        {/* 统计卡片区域 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {statistics.map((stat, index) => (
            <Col key={index} span={8}>
              <Card
                hoverable
                className={styles.statCard}
                {...(stat.link ? { onClick: () => window.location.href = stat.link } : {})}
                style={stat.link ? { cursor: 'pointer' } : {}}
              >
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={stat.icon}
                  styles={{
                    content: { color: stat.color }
                  }}
                />
                {stat.link && (
                  <Link to={stat.link} style={{ display: 'block', marginTop: 8, color: stat.color }}>{t('pages.Dashboard.index_5')}</Link>
                )}
              </Card>
            </Col>
          ))}
        </Row>

        {/* 快速操作区域 */}
        <Card title={t('pages.Dashboard.index_6')} className={styles.quickActions}>
          <p style={{ textAlign: 'center', lineHeight: 2 }}>{t('pages.Dashboard.index_7')}</p>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;