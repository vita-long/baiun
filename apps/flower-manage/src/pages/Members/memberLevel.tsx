import React, { useState } from 'react';
import { Button, Table, Modal, Form, Input, Switch, message, Space, InputNumber, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { getMemberLevels, createMemberLevel, updateMemberLevel, deleteMemberLevel } from '@/service/member';
import type { MemberLevel, CreateMemberLevelDto, UpdateMemberLevelDto } from '@/service/member';

interface MemberLevelProps {
  loading: boolean;
}

/**
 * 会员等级管理组件
 */
const MemberLevelPage: React.FC<MemberLevelProps> = ({ loading }) => {
  // 会员等级管理相关状态
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<MemberLevel | null>(null);
  const [levelForm] = Form.useForm();

  // 使用ahooks的useRequest管理API请求
  const { data: memberLevels, run: fetchMemberLevels, loading: levelsLoading } = useRequest(getMemberLevels);

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
      title: '折扣',
      dataIndex: 'discountRate',
      key: 'discountRate',
      width: 100,
      render: (rate: number) => Number(rate) === 0 ? '无折扣' : `${(rate * 10).toFixed(1)}折`
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

  // 处理打开添加会员等级模态框
  const handleAddLevel = () => {
    setEditingLevel(null);
    levelForm.resetFields();
    setIsLevelModalOpen(true);
  };

  // 处理打开编辑会员等级模态框
  const handleEditLevel = (level: MemberLevel) => {
    setEditingLevel(level);
    levelForm.setFieldsValue(level);
    setIsLevelModalOpen(true);
  };

  // 处理删除会员等级
  const handleDeleteLevel = (id: number) => {
    deleteMemberLevel(id)
      .then(() => {
        message.success('会员等级删除成功');
        fetchMemberLevels();
      })
      .catch(() => {
        message.error('会员等级删除失败');
      });
  };

  // 处理保存会员等级（添加或修改）
  const handleSaveLevel = () => {
    levelForm
      .validateFields()
      .then(values => {
        if (editingLevel) {
          // 修改现有会员等级
          updateMemberLevel(editingLevel.id, values as UpdateMemberLevelDto)
            .then(() => {
              message.success('会员等级修改成功');
              fetchMemberLevels();
              setIsLevelModalOpen(false);
            })
            .catch(() => {
              message.error('会员等级修改失败');
            });
        } else {
          console.log(values);
          // 添加新会员等级
          createMemberLevel(values as CreateMemberLevelDto)
            .then(() => {
              message.success('会员等级添加成功');
              fetchMemberLevels();
              setIsLevelModalOpen(false);
            })
            .catch(() => {
              message.error('会员等级添加失败');
            });
        }
      })
      .catch(info => {
        console.log('表单验证失败:', info);
      });
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddLevel}>
          添加等级
        </Button>
      </div>

      <Table
        columns={levelColumns}
        dataSource={memberLevels || []}
        rowKey="id"
        loading={levelsLoading || loading}
        pagination={{
          pageSize: 10
        }}
      />

      {/* 会员等级添加/编辑模态框 */}
      <Modal
        title={editingLevel ? '编辑会员等级' : '添加会员等级'}
        open={isLevelModalOpen}
        onOk={handleSaveLevel}
        onCancel={() => setIsLevelModalOpen(false)}
      >
        <Form form={levelForm} layout="vertical">
          <Form.Item
            name="name"
            label="等级名称"
            rules={[{ required: true, message: '请输入等级名称' }]}
          >
            <Input placeholder="请输入等级名称" disabled={!!editingLevel} />
          </Form.Item>

          <Form.Item
            name="code"
            label="等级标识"
            rules={[{ required: true, message: '请输入等级标识' }]}
          >
            <Input placeholder="请输入等级标识" disabled={!!editingLevel} />
          </Form.Item>

          <Form.Item
            name="subscriptionPrice"
            label="订阅价格"
            rules={[{ required: true, message: '请输入订阅价格' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入订阅价格" />
          </Form.Item>

          <Form.Item
            name="validityPeriod"
            label="有效期(月)"
            rules={[{ required: true, message: '请输入有效期' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0表示永久" />
          </Form.Item>

          <Form.Item
            name="discountRate"
            label="折扣"
            rules={[{ required: true, message: '请输入折扣' }]}
          >
            <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} placeholder="例如：0.8表示8折" />
          </Form.Item>

          <Form.Item
            name="freeShippingTickets"
            label="每月免运费券"
            rules={[{ required: true, message: '请输入每月免运费券数量' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入每月免运费券数量" />
          </Form.Item>

          <Form.Item
            name="unlimitedFreeShipping"
            label="无限免运费"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="freeBouquetUpgrades"
            label="每月免费花束升级次数"
            rules={[{ required: true, message: '请输入每月免费花束升级次数' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入每月免费花束升级次数" />
          </Form.Item>

          <Form.Item
            name="holidayGifts"
            label="节日礼物"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="subscriptionDiscount"
            label="订阅折扣"
            rules={[{ required: true, message: '请输入订阅折扣' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="例如：10表示10%折扣" />
          </Form.Item>

          <Form.Item
            name="description"
            label="等级描述"
          >
            <Input.TextArea rows={4} placeholder="请输入等级描述" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="状态"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MemberLevelPage;
