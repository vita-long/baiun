import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, InputNumber, message, Space, Tag, Select } from 'antd';
import { useRequest } from 'ahooks';
import {
  getMembers,
  adjustPoints,
  updateMemberStatus
} from '@/service/member';
import type {
  MemberInfo,
  AdjustPointsDto,
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
      width: 220
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      render: (_: string, record: MemberInfo) => (
        <span>{record.user.username}</span>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      render: (_: string, record: MemberInfo) => (
        <span>{record.user.email}</span>
      )
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (_: string, record: MemberInfo) => (
        <span>{record.user.phone ?? '-'}</span>
      )
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
          amount: values.amount,
          type: values.type,
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
            name="type"
            label="变动类型"
            rules={[{ required: true, message: '请选择变动类型' }]}
          >
            <Select options={[{
              label: '增加',
              value: 'increase'
            }, {
              label: '减少',
              value: 'decrease'
            }]} />
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
    </div>
  );
};

export default MemberInfoPage;
