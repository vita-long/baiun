import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, InputNumber, message, Space, Tag, Timeline } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import {
  getMembers,
  getMemberInfo,
  adjustPoints,
  getPointsHistory,
  updateMemberStatus
} from '@/service/member';
import type {
  MemberInfo,
  AdjustPointsDto,
  PointsHistory,
  UpdateMemberStatusType
} from '@/service/member';
import dayjs from 'dayjs';

interface MemberInfoProps {
  loading: boolean;
}

/**
 * 会员信息管理组件
 */
const MemberInfoPage: React.FC<MemberInfoProps> = ({ loading }) => {
  // 会员信息管理相关状态
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [adjustForm] = Form.useForm();

  // 会员详情相关状态
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailMemberId, setDetailMemberId] = useState<string>('');
  const [detailMemberInfo, setDetailMemberInfo] = useState<MemberInfo | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState('info');
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
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
    loading: pointsHistoryLoading
  } = useRequest(
    (userId: string, page: number, limit: number) => getPointsHistory(userId, page, limit),
    {
      manual: true,
      onSuccess: (data) => setPointsHistory(data.list)
    }
  );

  // 使用useRequest获取会员列表数据
  const { data: membersData, run: fetchMembers, loading: membersLoading } = useRequest(
    () => getMembers(currentPage, pageSize),
    { manual: false }
  );

  // 会员信息表格列配置
  const memberColumns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120
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
      render: (level: string | any) => (
        <Tag color="blue">{typeof level === 'string' ? level : level.name}</Tag>
      )
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      width: 100
    },

    {
      title: '加入日期',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (createdAt: string) => dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '状态',
      dataIndex: 'subscriptionStatus',
      key: 'subscriptionStatus',
      width: 80,
      render: (subscriptionStatus: 'active' | 'inactive') => (
        <Tag color={subscriptionStatus === 'active' ? 'green' : 'red'}>
          {subscriptionStatus === 'active' ? '启用' : '停用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: MemberInfo) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<InfoCircleOutlined />}
            onClick={() => handleViewDetail(record.userId)}
            size="small"
          >
            详情
          </Button>
          {record.subscriptionStatus === 'active' ? (
            <Button
              type="link"
              onClick={() => handleUpdateMemberStatus(record.userId, 'inactive')}
              size="small"
            >
              停用
            </Button>
          ) : (
            <Button
              type="link"
              onClick={() => handleUpdateMemberStatus(record.userId, 'active')}
              size="small"
            >
              启用
            </Button>
          )}
          <Button
            type="link"
            onClick={() => handleAdjustPoints(record.userId)}
            size="small"
          >
            调整积分
          </Button>

        </Space>
      )
    }
  ];

  // 当页码变化时重新获取会员列表
  useEffect(() => {
    fetchMembers();
  }, [currentPage]);

  // 监听会员详情数据变化
  useEffect(() => {
    if (memberDetail) {
      setDetailMemberInfo(memberDetail);
    }
  }, [memberDetail]);

  // 处理查看会员详情
  const handleViewDetail = (userId: string) => {
    setDetailMemberId(userId);
    setIsDetailModalOpen(true);
    fetchMemberDetail(userId);
    setActiveDetailTab('info');
  };

  // 处理更新会员状态（启用/停用）
  const handleUpdateMemberStatus = (userId: string, active: UpdateMemberStatusType) => {
    updateMemberStatus(userId, active)
      .then(() => {
        fetchMembers(); // 刷新会员列表
      })
      .catch(() => {
        message.error('调整会员失败');
      });
  };

  // 处理调整积分
  const handleAdjustPoints = (userId: string) => {
    setSelectedMember(userId);
    adjustForm.resetFields();
    setIsAdjustModalOpen(true);
  };

  // 处理保存积分调整
  const handleSaveAdjustment = () => {
    adjustForm
      .validateFields()
      .then(values => {
        // 调整积分
        const dto: AdjustPointsDto = {
          userId: selectedMember,
          points: values.amount,
          reason: values.reason
        };
        adjustPoints(dto)
          .then(() => {
            message.success('积分调整成功');
            fetchMembers();
            setIsAdjustModalOpen(false);
          })
          .catch(() => {
            message.error('积分调整失败');
          });
      })
      .catch(info => {
        console.log('表单验证失败:', info);
      });
  };

  // 处理详情页签切换
  const handleDetailTabChange = (key: string) => {
    setActiveDetailTab(key);
    if (key === 'pointsHistory') {
      fetchPointsHistory(detailMemberId, 1, pageSize);
    }
  };

  return (
    <div>
      <Table
        columns={memberColumns}
        dataSource={membersData?.list || []}
        rowKey="userId"
        loading={membersLoading || loading}
        pagination={{
          current: currentPage,
          pageSize,
          total: membersData?.total || 0,
          onChange: (page) => setCurrentPage(page)
        }}
      />

      {/* 积分调整模态框 */}
      <Modal
        title="调整积分"
        open={isAdjustModalOpen}
        onOk={handleSaveAdjustment}
        onCancel={() => setIsAdjustModalOpen(false)}
      >
        <Form form={adjustForm} layout="vertical">
          <Form.Item
            name="amount"
            label="积分变动"
            rules={[{ required: true, message: '请输入积分变动' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="正数增加，负数减少" />
          </Form.Item>

          <Form.Item
            name="reason"
            label="调整原因"
            rules={[{ required: true, message: '请输入调整原因' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入调整原因" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 会员详情模态框 */}
      <Modal
        title="会员详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={800}
        footer={null}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>加载中...</div>
        ) : detailMemberInfo ? (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h3>基本信息</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px', marginTop: 10 }}>
                <div><strong>用户ID：</strong>{detailMemberInfo.userId}</div>
                <div><strong>当前等级：</strong><Tag color="blue">{detailMemberInfo.currentLevel.name}</Tag></div>
                <div><strong>积分：</strong>{detailMemberInfo.points}</div>
                <div><strong>订阅状态：</strong>
                  <Tag color={
                    detailMemberInfo.subscriptionStatus === 'active' ? 'green' :
                      detailMemberInfo.subscriptionStatus === 'inactive' ? 'red' : 'orange'
                  }>
                    {detailMemberInfo.subscriptionStatus === 'active' ? '活跃' :
                      detailMemberInfo.subscriptionStatus === 'inactive' ? '不活跃' : '已过期'}
                  </Tag>
                </div>
                <div><strong>有效期至：</strong>{detailMemberInfo.expireTime || '永久'}</div>
                <div><strong>剩余免运费券：</strong>{detailMemberInfo.freeShippingTicketsBalance}</div>
                <div><strong>剩余免费花束升级次数：</strong>{detailMemberInfo.freeBouquetUpgradesBalance}</div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h3>历史记录</h3>
              <Space size="middle" style={{ marginBottom: 10 }}>
                <Button
                  type={activeDetailTab === 'pointsHistory' ? 'primary' : 'default'}
                  onClick={() => handleDetailTabChange('pointsHistory')}
                >
                  积分历史
                </Button>
              </Space>

              <div style={{ marginTop: 20 }}>
                {activeDetailTab === 'pointsHistory' && (
                  <>
                    {pointsHistoryLoading ? (
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
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>未找到会员信息</div>
        )}
      </Modal>
    </div>
  );
};

export default MemberInfoPage;
