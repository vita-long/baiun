
import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { AppstoreOutlined, ShoppingOutlined, DatabaseOutlined } from '@ant-design/icons';
import Layout from '@/components/Layout';
import styles from './index.module.less';

import { Button } from '@baiun/component-ant';

const Dashboard: React.FC = () => {
  // 首页统计数据
  const statistics = [
    {
      title: '商品分类数',
      value: 15,
      icon: <AppstoreOutlined />,
      color: '#1890ff',
      link: '/categories',
    },
    {
      title: '商品总数',
      value: 280,
      icon: <ShoppingOutlined />,
      color: '#52c41a',
      link: '/products',
    },
    {
      title: '数据总量',
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
          <h2>欢迎使用鲜花管理系统</h2>
          <Button type="primary">测试</Button>
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
                  <Link to={stat.link} style={{ display: 'block', marginTop: 8, color: stat.color }}>
                    查看详情 →
                  </Link>
                )}
              </Card>
            </Col>
          ))}
        </Row>

        {/* 快速操作区域 */}
        <Card title="快速操作" className={styles.quickActions}>
          <p style={{ textAlign: 'center', lineHeight: 2 }}>
            您可以通过左侧菜单访问系统的各项功能，包括分类管理和商品管理。
            请根据需要选择相应的功能模块进行操作。
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;