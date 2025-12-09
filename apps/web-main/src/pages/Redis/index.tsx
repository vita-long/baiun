import React, { useState, useEffect } from 'react';
import { Table, Button, Input, message, Typography, Card, Row, Col, Divider, Modal, Empty, Spin } from 'antd';
import { ReloadOutlined, DeleteOutlined, ClockCircleOutlined, KeyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { get, post } from '@baiun/utils';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// 定义Redis数据项的接口
interface RedisItem {
  key: string;
  value: string;
  ttl: number;
}

const RedisPage: React.FC = () => {
  const [redisData, setRedisData] = useState<RedisItem[]>([]);
  const [filteredData, setFilteredData] = useState<RedisItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false);

  // 获取Redis数据
  const fetchRedisData = async () => {
    setLoading(true);
    try {
      const result = await get<{ redisList: RedisItem[] }>('http://localhost:3012/api/health/redis/list');
      setRedisData(result?.redisList || []);
      setFilteredData(result?.redisList || []);
      message.success('Redis数据获取成功');
    } catch (error) {
      console.error('获取Redis数据失败:', error);
      message.error('获取Redis数据失败，请检查服务连接');
    } finally {
      setLoading(false);
    }
  };

  // 初始化时获取数据
  useEffect(() => {
    fetchRedisData();
  }, []);

  // 搜索功能
  const handleSearch = (value: string) => {
    if (value.trim()) {
      const filtered = redisData.filter(item =>
        item.key.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(redisData);
    }
  };

  // 刷新功能
  const handleRefresh = () => {
    fetchRedisData();
    setSelectedKey(null);
  };

  // 全部删除功能
  const handleDeleteAll = () => {
    setConfirmModalVisible(true);
  };

  // 确认删除
  const confirmDeleteAll = async () => {
    setLoading(true);
    try {
      await post('http://localhost:3012/api/health/redis/delete', {
        pattern: '*'
      });
      setRedisData([]);
      setFilteredData([]);
      setSelectedKey(null);
      message.success('全部缓存已删除');
    } catch (error) {
      console.error('删除全部缓存失败:', error);
      message.error('删除全部缓存失败');
    } finally {
      setLoading(false);
      setConfirmModalVisible(false);
    }
  };

  // 格式化TTL显示
  const formatTTL = (ttl: number): string => {
    if (ttl === -1) return '永不过期';
    if (ttl < 60) return `${ttl}秒`;
    if (ttl < 3600) return `${Math.floor(ttl / 60)}分${ttl % 60}秒`;
    return `${Math.floor(ttl / 3600)}时${Math.floor((ttl % 3600) / 60)}分`;
  };

  // 尝试解析JSON格式的值
  const parseValue = (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  // 表格列配置
  const columns: ColumnsType<RedisItem> = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      render: (text) => (
        <Text
          strong
          style={{ cursor: 'pointer', color: '#1890ff' }}
          onClick={() => setSelectedKey(text)}
        >
          {text}
        </Text>
      ),
    },
    {
      title: 'TTL',
      dataIndex: 'ttl',
      key: 'ttl',
      width: 120,
      render: (ttl) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ClockCircleOutlined style={{ marginRight: 4, fontSize: 14, color: ttl > 300 ? '#52c41a' : '#fa8c16' }} />
          <Text style={{ color: ttl > 300 ? '#52c41a' : '#fa8c16' }}>
            {formatTTL(ttl)}
          </Text>
        </div>
      ),
    },
  ];

  const selectedItem = selectedKey ? redisData.find(item => item.key === selectedKey) : null;

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
            <KeyOutlined style={{ marginRight: 8 }} />
            Redis 缓存管理
          </div>
        }
        extra={
          <div style={{ display: 'flex', gap: 8 }}>
            <Search
              placeholder="搜索 Key"
              allowClear
              onSearch={handleSearch}
              style={{ width: 250 }}
              size="small"
            />
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              size="small"
              loading={loading}
            >
              刷新
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteAll}
              size="small"
              disabled={redisData.length === 0}
            >
              全部删除
            </Button>
          </div>
        }
        style={{ marginBottom: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
      >
        <Row gutter={24} style={{ minHeight: 600 }}>
          <Col xs={24} lg={8}>
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text>缓存键列表</Text>
                  <Text type="secondary">({filteredData.length} 个键)</Text>
                </div>
              }
              style={{ height: '100%', borderRadius: 8 }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin />
                </div>
              ) : filteredData.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={filteredData}
                  rowKey="key"
                  pagination={false}
                  size="small"
                  scroll={{ y: 'calc(100vh - 300px)' }}
                  onRow={(record) => ({
                    onClick: () => setSelectedKey(record.key),
                    style: {
                      backgroundColor: selectedKey === record.key ? '#e6f7ff' : 'transparent',
                      cursor: 'pointer'
                    },
                  })}
                />
              ) : (
                <Empty
                  description="暂无缓存数据"
                  style={{ padding: 40 }}
                />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={16}>
            <Card
              title="缓存详情"
              style={{ height: '100%', borderRadius: 8 }}
            >
              {selectedItem ? (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Key: </Text>
                    <Text style={{ marginLeft: 8, color: '#1890ff', fontSize: 16 }}>
                      {selectedItem.key}
                    </Text>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>TTL: </Text>
                    <Text style={{ marginLeft: 8, color: selectedItem.ttl > 300 ? '#52c41a' : '#fa8c16' }}>
                      {formatTTL(selectedItem.ttl)}
                    </Text>
                  </div>
                  <Divider />
                  <Title level={5} style={{ marginBottom: 16 }}>值内容:</Title>
                  <Card
                    bordered={false}
                    style={{
                      backgroundColor: '#001529',
                      borderRadius: 8,
                      overflow: 'hidden'
                    }}
                  >
                    <pre style={{
                      backgroundColor: '#001529',
                      color: '#fff',
                      padding: 20,
                      margin: 0,
                      overflow: 'auto',
                      fontSize: 14,
                      lineHeight: 1.6,
                      maxHeight: 'calc(100vh - 350px)',
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
                    }}>
                      {JSON.stringify(parseValue(selectedItem.value), null, 2)}
                    </pre>
                  </Card>
                </div>
              ) : (
                <Empty
                  description={
                    <Paragraph>
                      请从左侧键列表中选择一个键来查看详情
                    </Paragraph>
                  }
                  style={{ padding: 60 }}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 删除确认弹窗 */}
      <Modal
        title="确认删除"
        open={confirmModalVisible}
        onOk={confirmDeleteAll}
        onCancel={() => setConfirmModalVisible(false)}
        okText="确认"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        loading={loading}
      >
        <p>确定要删除全部缓存数据吗？此操作不可恢复。</p>
      </Modal>
    </div>
  );
};

export default RedisPage;