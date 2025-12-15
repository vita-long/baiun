import React, { useState, useEffect } from 'react';
import { useRequest } from 'ahooks';
import { Button, Table, Modal, Form, Input, Switch, message, Space, InputNumber, Card, Tabs, Tag, Timeline } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Layout from '@/components/Layout';
import styles from './index.module.less';
import {
  getMemberLevels,
  createMemberLevel,
  updateMemberLevel,
  deleteMemberLevel,
  getMemberInfo,
  adjustPoints,
  adjustGrowthValue,
  getPointsHistory,
  getGrowthValueHistory,
  getMembers
} from '@/service/member';
import type {
  MemberLevel,
  MemberInfo,
  CreateMemberLevelDto,
  UpdateMemberLevelDto,
  AdjustPointsDto,
  AdjustGrowthValueDto,
  PointsHistory,
  GrowthValueHistory,
  PaginationResponse,
  MemberListItem
} from '@/service/member';

const Members: React.FC = () => {
  // 会员等级管理相关状态
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<MemberLevel | null>(null);
  const [levelForm] = Form.useForm();

  // 会员信息管理相关状态
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'points' | 'growth'>('points');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [adjustForm] = Form.useForm();

  // 会员详情相关状态
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailMemberId, setDetailMemberId] = useState<string>('');
  const [detailMemberInfo, setDetailMemberInfo] = useState<MemberInfo | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState('info');
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
  const [growthHistory, setGrowthHistory] = useState<GrowthValueHistory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 使用useRequest获取会员详情
  const {
    run: fetchMemberDetail,
    data: memberDetail,
    loading: detailLoading
  } = useRequest(getMemberInfo, { manual: true });

  // 使用useRequest获取积分历史
  const {
    run: fetchPointsHistory,
    data: pointsHistoryData,
    loading: pointsHistoryLoading
  } = useRequest(
    (userId: string, page: number, limit: number) => getPointsHistory(userId, page, limit),
    {
      manual: true,
      onSuccess: (data) => setPointsHistory(data.items)
    }
  );

  // 使用useRequest获取成长值历史
  const {
    run: fetchGrowthHistory,
    data: growthHistoryData,
    loading: growthHistoryLoading
  } = useRequest(
    (userId: string, page: number, limit: number) => getGrowthValueHistory(userId, page, limit),
    {
      manual: true,
      onSuccess: (data) => setGrowthHistory(data.items)
    }
  );

  // 使用ahooks的useRequest管理API请求
  const { data: memberLevels, run: fetchMemberLevels, loading: levelsLoading } = useRequest(getMemberLevels);

  // 使用useRequest获取会员列表数据
  const { data: membersData, run: fetchMembers, loading: membersLoading } = useRequest(
    () => getMembers(currentPage, pageSize),
    { manual: false }
  );

  // 计算会员列表数据
  const members = membersData?.items || [];
  const totalMembers = membersData?.total || 0;

  // 会员等级表格列配置
  const levelColumns = [
    {
      title: '等级名称',
      dataIndex: 'name',
      key: 'name',
      width: 120
    },
    {
      title: '等级标识',
      dataIndex: 'code',
      key: 'code',
      width: 100
    },
    {
      title: '订阅价格',
      dataIndex: 'subscriptionPrice',
      key: 'subscriptionPrice',
      width: 100,
      render: (price: number) => `¥${price}`
    },
    {
      title: '有效期(月)',
      dataIndex: 'validityPeriod',
      key: 'validityPeriod',
      width: 100,
      render: (period: number) => period === 0 ? '永久' : `${period}个月`
    },
    {
      title: '折扣率',
      dataIndex: 'discountRate',
      key: 'discountRate',
      width: 100,
      render: (rate: number) => `${(rate * 10).toFixed(1)}折`
    },
    {
      title: '每月免运费券',
      dataIndex: 'freeShippingTickets',
      key: 'freeShippingTickets',
      width: 120
    },
    {
      title: '无限免运费',
      dataIndex: 'unlimitedFreeShipping',
      key: 'unlimitedFreeShipping',
      width: 100,
      render: (value: boolean) => (
        <Switch checked={value} disabled />
      )
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: MemberLevel) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditLevel(record)}
            size="small"
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteLevel(record.id)}
            size="small"
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  // 会员列表表格列配置
  const memberColumns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 150
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 100
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: '当前等级',
      dataIndex: 'currentLevel',
      key: 'currentLevel',
      width: 100,
      render: (level: string) => (
        <Tag color="blue">{level}</Tag>
      )
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      width: 80
    },
    {
      title: '成长值',
      dataIndex: 'growthValue',
      key: 'growthValue',
      width: 80
    },
    {
      title: '加入日期',
      dataIndex: 'joinDate',
      key: 'joinDate',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃' : '停用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<InfoCircleOutlined />}
            onClick={() => handleViewDetail(record.userId)}
            size="small"
          >
            详情
          </Button>
          <Button
            type="link"
            onClick={() => handleAdjustPoints(record.userId)}
            size="small"
          >
            调整积分
          </Button>
          <Button
            type="link"
            onClick={() => handleAdjustGrowth(record.userId)}
            size="small"
          >
            调整成长值
          </Button>
        </Space>
      )
    }
  ];

  // 获取会员等级列表
  useEffect(() => {
    fetchMemberLevels();
  }, []);

  // 当页码变化时重新获取会员列表
  useEffect(() => {
    fetchMembers();
  }, [currentPage]);

  // 处理分页变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 处理新增会员等级
  const handleAddLevel = () => {
    setEditingLevel(null);
    levelForm.resetFields();
    setIsLevelModalOpen(true);
  };

  // 处理编辑会员等级
  const handleEditLevel = (level: MemberLevel) => {
    setEditingLevel(level);
    levelForm.setFieldsValue(level);
    setIsLevelModalOpen(true);
  };

  // 处理保存会员等级
  const handleSaveLevel = () => {
    levelForm.validateFields().then(values => {
      console.log(values)
      const levelData: CreateMemberLevelDto | UpdateMemberLevelDto = {
        ...values,
        holidayGifts: values.holidayGifts ?? false,
        unlimitedFreeShipping: values.unlimitedFreeShipping ?? false
      };

      if (editingLevel) {
        updateMemberLevel(editingLevel.id, levelData as UpdateMemberLevelDto)
          .then(() => {
            message.success('会员等级更新成功');
            setIsLevelModalOpen(false);
            fetchMemberLevels();
          })
          .catch(() => {
            message.error('会员等级更新失败');
          });
      } else {
        createMemberLevel(levelData as CreateMemberLevelDto)
          .then(() => {
            message.success('会员等级创建成功');
            setIsLevelModalOpen(false);
            fetchMemberLevels();
          })
          .catch(() => {
            message.error('会员等级创建失败');
          });
      }
    }).catch(info => {
      console.log('表单验证失败:', info);
    });
  };

  // 处理删除会员等级
  const handleDeleteLevel = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个会员等级吗？',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        deleteMemberLevel(id)
          .then(() => {
            message.success('会员等级删除成功');
            fetchMemberLevels();
          })
          .catch(() => {
            message.error('会员等级删除失败');
          });
      }
    });
  };

  // 处理调整积分
  const handleAdjustPoints = (userId: string) => {
    setSelectedMember(userId);
    setAdjustType('points');
    adjustForm.resetFields();
    setIsAdjustModalOpen(true);
  };

  // 处理调整成长值
  const handleAdjustGrowth = (userId: string) => {
    setSelectedMember(userId);
    setAdjustType('growth');
    adjustForm.resetFields();
    setIsAdjustModalOpen(true);
  };

  // 处理保存积分/成长值调整
  const handleSaveAdjust = () => {
    adjustForm.validateFields().then(values => {
      if (adjustType === 'points') {
        const adjustData: AdjustPointsDto = {
          userId: selectedMember,
          points: values.amount,
          reason: values.reason
        };

        adjustPoints(adjustData)
          .then(() => {
            message.success('积分调整成功');
            setIsAdjustModalOpen(false);
          })
          .catch(() => {
            message.error('积分调整失败');
          });
      } else {
        const adjustData: AdjustGrowthValueDto = {
          userId: selectedMember,
          growthValue: values.amount,
          reason: values.reason
        };

        adjustGrowthValue(adjustData)
          .then(() => {
            message.success('成长值调整成功');
            setIsAdjustModalOpen(false);
          })
          .catch(() => {
            message.error('成长值调整失败');
          });
      }
    }).catch(info => {
      console.log('表单验证失败:', info);
    });
  };

  // 处理查看会员详情
  const handleViewDetail = (userId: string) => {
    setDetailMemberId(userId);
    setIsDetailModalOpen(true);
    fetchMemberDetail(userId);
    setActiveDetailTab('info');
  };

  // 监听会员详情数据变化
  useEffect(() => {
    if (memberDetail) {
      setDetailMemberInfo(memberDetail);
    }
  }, [memberDetail]);

  // 处理详情页签切换
  const handleDetailTabChange = (key: string) => {
    setActiveDetailTab(key);
    if (key === 'pointsHistory') {
      fetchPointsHistory(detailMemberId, 1, pageSize);
    } else if (key === 'growthHistory') {
      fetchGrowthHistory(detailMemberId, 1, pageSize);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h3 className={styles.title}>会员管理</h3>

        <Tabs defaultActiveKey="1" items={[
          {
            key: '1',
            label: '会员等级管理',
            children: (
              <Card>
                <div className={styles.header}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddLevel}
                  >
                    新增会员等级
                  </Button>
                </div>

                <Table
                  columns={levelColumns}
                  dataSource={memberLevels}
                  rowKey="id"
                  loading={levelsLoading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1000 }}
                />
              </Card>
            ),
          },
          {
            key: '2',
            label: '会员信息管理',
            children: (
              <Card>
                <Table
                  columns={memberColumns}
                  dataSource={members}
                  rowKey="userId"
                  loading={membersLoading}
                  pagination={{
                    total: totalMembers,
                    pageSize: pageSize,
                    current: currentPage,
                    onChange: handlePageChange,
                    showTotal: (total) => `共 ${total} 条记录`
                  }}
                  scroll={{ x: 1000 }}
                />
              </Card>
            ),
          },
        ]} />
      </div>

      {/* 会员等级编辑模态框 */}
      <Modal
        title={editingLevel ? '编辑会员等级' : '新增会员等级'}
        open={isLevelModalOpen}
        onOk={handleSaveLevel}
        onCancel={() => setIsLevelModalOpen(false)}
        width={800}
      >
        <Form
          form={levelForm}
          layout="vertical"
          initialValues={{
            validityPeriod: 12,
            discountRate: 1.0,
            subscriptionDiscount: 1.0,
            isActive: true
          }}
        >
          <Form.Item
            name="name"
            label="等级名称"
            rules={[{ required: true, message: '请输入等级名称' }]}
          >
            <Input placeholder="如：种子会员、玫瑰会员" />
          </Form.Item>

          <Form.Item
            name="code"
            label="等级标识"
            rules={[{ required: true, message: '请输入等级标识' }]}
          >
            <Input placeholder="如：seed、rose" />
          </Form.Item>

          <Form.Item
            name="subscriptionPrice"
            label="订阅价格"
            rules={[{ required: true, message: '请输入订阅价格' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0.00"
              step={0.01}
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="validityPeriod"
            label="有效期(月)"
            rules={[{ required: true, message: '请输入有效期' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="12"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="discountRate"
            label="折扣率"
            rules={[{ required: true, message: '请输入折扣率' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0.95"
              step={0.01}
              min={0.01}
              max={1.0}
            />
          </Form.Item>

          <Form.Item
            name="freeShippingTickets"
            label="每月免运费券数量"
            rules={[{ required: true, message: '请输入免运费券数量' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="2"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="unlimitedFreeShipping"
            label="全年无限次免运费"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="freeBouquetUpgrades"
            label="每月免费花束升级次数"
            rules={[{ required: true, message: '请输入免费花束升级次数' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="1"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="holidayGifts"
            label="重大节日赠送神秘高阶花礼"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="subscriptionDiscount"
            label="订阅折扣率"
            rules={[{ required: true, message: '请输入订阅折扣率' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0.9"
              step={0.01}
              min={0.01}
              max={1.0}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="等级描述"
          >
            <Input.TextArea rows={3} placeholder="请输入等级描述" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="状态"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 积分/成长值调整模态框 */}
      <Modal
        title={adjustType === 'points' ? '调整积分' : '调整成长值'}
        open={isAdjustModalOpen}
        onOk={handleSaveAdjust}
        onCancel={() => setIsAdjustModalOpen(false)}
      >
        <Form
          form={adjustForm}
          layout="vertical"
        >
          <Form.Item
            name="amount"
            label={adjustType === 'points' ? '积分数量' : '成长值数量'}
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder={`请输入要${adjustType === 'points' ? '调整' : '增加'}的${adjustType === 'points' ? '积分' : '成长值'}`}
              step={1}
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="调整原因"
            rules={[{ required: true, message: '请输入调整原因' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入调整原因" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 会员详情模态框 */}
      <Modal
        title="会员详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={800}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>加载中...</div>
        ) : detailMemberInfo ? (
          <Tabs
            activeKey={activeDetailTab}
            onChange={handleDetailTabChange}
            items={[
              {
                key: 'info',
                label: '基本信息',
                children: (
                  <div className={styles.detailSection}>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>会员ID：</div>
                      <div className={styles.detailValue}>{detailMemberInfo.userId}</div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>当前等级：</div>
                      <div className={styles.detailValue}>
                        <Tag color="blue">{detailMemberInfo.currentLevel.name}</Tag>
                      </div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>成长值：</div>
                      <div className={styles.detailValue}>{detailMemberInfo.growthValue}</div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>积分：</div>
                      <div className={styles.detailValue}>{detailMemberInfo.points}</div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>会员到期时间：</div>
                      <div className={styles.detailValue}>
                        {detailMemberInfo.expireTime ? new Date(detailMemberInfo.expireTime).toLocaleDateString() : '永久'}
                      </div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>免运费券余额：</div>
                      <div className={styles.detailValue}>{detailMemberInfo.freeShippingTicketsBalance}</div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>免费花束升级次数余额：</div>
                      <div className={styles.detailValue}>{detailMemberInfo.freeBouquetUpgradesBalance}</div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>订阅状态：</div>
                      <div className={styles.detailValue}>
                        <Tag color={
                          detailMemberInfo.subscriptionStatus === 'active' ? 'green' :
                            detailMemberInfo.subscriptionStatus === 'expired' ? 'red' : 'orange'
                        }>
                          {detailMemberInfo.subscriptionStatus === 'active' ? '活跃' :
                            detailMemberInfo.subscriptionStatus === 'expired' ? '已过期' : '未激活'}
                        </Tag>
                      </div>
                    </div>
                    <div className={styles.detailRow}>
                      <div className={styles.detailLabel}>加入时间：</div>
                      <div className={styles.detailValue}>
                        {new Date(detailMemberInfo.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'pointsHistory',
                label: '积分历史',
                children: (
                  <>{
                    pointsHistoryLoading ? (
                      <div style={{ textAlign: 'center', padding: '50px 0' }}>加载中...</div>
                    ) : pointsHistory.length > 0 ? (
                      <Timeline>
                        {pointsHistory.map((history) => (
                          <Timeline.Item key={history.id}>
                            <div>
                              <strong>积分变动：{history.points > 0 ? '+' : ''}{history.points}</strong>
                              <br />
                              剩余积分：{history.totalPoints}
                              <br />
                              原因：{history.reason}
                              <br />
                              时间：{new Date(history.createdAt).toLocaleString()}
                            </div>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '50px 0' }}>暂无积分历史记录</div>
                    )
                  }</>
                ),
              },
              {
                key: 'growthHistory',
                label: '成长值历史',
                children: (
                  <>{
                    growthHistoryLoading ? (
                      <div style={{ textAlign: 'center', padding: '50px 0' }}>加载中...</div>
                    ) : growthHistory.length > 0 ? (
                      <Timeline>
                        {growthHistory.map((history) => (
                          <Timeline.Item key={history.id}>
                            <div>
                              <strong>成长值变动：{history.growthValue > 0 ? '+' : ''}{history.growthValue}</strong>
                              <br />
                              剩余成长值：{history.totalGrowthValue}
                              <br />
                              原因：{history.reason}
                              <br />
                              时间：{new Date(history.createdAt).toLocaleString()}
                            </div>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '50px 0' }}>暂无成长值历史记录</div>
                    )
                  }</>
                ),
              },
            ]}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>未找到会员信息</div>
        )}
      </Modal>
    </Layout>
  );
};

export default Members;