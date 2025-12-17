import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, message, Popconfirm, Card } from 'antd';
import dayjs from 'dayjs';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, updateCouponStatus } from '@/service/coupon';
import { type Coupon, type CouponCreateRequest, type CouponType, type CouponStatus, CouponTypeToName, CouponTypeMap } from '@/types/coupon';
import styles from './index.module.less';
import Layout from '@/components/Layout';

const { Option } = Select;
const { RangePicker } = DatePicker;

const CouponStatusMap = {
  enabled: '启用',
  disabled: '禁用',
  expired: '已过期',
};

const CouponPage: React.FC = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, loading, run: fetchCoupons } = useRequest(
    () => getCoupons({
      page,
      pageSize,
      ...searchForm.getFieldsValue(),
    }),
    { manual: true }
  );

  // 初始加载数据
  React.useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // 刷新数据
  const refreshData = () => {
    fetchCoupons();
  };

  // 搜索
  const handleSearch = () => {
    setPage(1);
    fetchCoupons();
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setPage(1);
    fetchCoupons();
  };

  // 显示添加/编辑模态框
  const showModal = (coupon?: Coupon) => {
    setEditingCoupon(coupon || null);
    if (coupon) {
      form.setFieldsValue(coupon);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCoupon(null);
    form.resetFields();
  };

  // 保存优惠卷
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);

      const startTime = dayjs(values.time[0]).format('YYYY-MM-DD HH:mm:ss');
      const endTime = dayjs(values.time[1]).format('YYYY-MM-DD HH:mm:ss');

      // 验证日期范围
      if (!startTime || !endTime) {
        message.error('请选择优惠卷的有效期');
        return;
      }
      const params = {
        name: values.name,
        type: values.type,
        value: values.fixedAmount,
        startTime,
        endTime,
        source: 'admin_create',
        totalQuantity: values.totalQuantity,
      }

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, params);
        message.success('优惠卷更新成功');
      } else {
        await createCoupon(params);
        message.success('优惠卷创建成功');
      }
      setIsModalVisible(false);
      setEditingCoupon(null);
      form.resetFields();
      refreshData();
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  // 删除优惠卷
  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon(id);
      message.success('优惠卷删除成功');
      refreshData();
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  // 更新优惠卷状态
  const handleUpdateStatus = async (id: string, status: 'enabled' | 'disabled') => {
    try {
      await updateCouponStatus(id, status);
      message.success(`优惠卷已${status === 'enabled' ? '启用' : '禁用'}`);
      refreshData();
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  // 表格列配置
  const columns = [
    { title: '优惠卷名称', dataIndex: 'name', key: 'name' },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: CouponType) => CouponTypeToName[type]
    },
    {
      title: '优惠信息',
      dataIndex: 'type',
      key: 'info',
      render: (type: CouponType, record: Coupon) => {
        if (type === CouponTypeMap.ShippingFree) {
          return `运费免单`;
        } else if (type === CouponTypeMap.Discount) {
          return `${(record.discountRate || 0) * 10}折`;
        } else {
          return `立减${record.value}元`;
        }
      }
    },
    { title: '总数量', dataIndex: 'totalQuantity', key: 'totalQuantity' },
    { title: '已使用', dataIndex: 'usedQuantity', key: 'usedQuantity' },
    {
      title: '有效期',
      key: 'date',
      render: (_: any, record: Coupon) => `${dayjs(record.startTime).format('YYYY-MM-DD HH:mm:ss')} 至 ${dayjs(record.endTime).format('YYYY-MM-DD HH:mm:ss')}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: CouponStatus) => CouponStatusMap[status]
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Coupon) => (
        <div className={styles.actionButtons}>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          {record.status === 'enabled' ? (
            <Button
              size="small"
              onClick={() => handleUpdateStatus(record.id, 'disabled')}
            >
              禁用
            </Button>
          ) : (
            <Button
              type="primary"
              size="small"
              onClick={() => handleUpdateStatus(record.id, 'enabled')}
            >
              启用
            </Button>
          )}
          <Popconfirm
            title="确定要删除这个优惠卷吗？"
            icon={<ExclamationCircleOutlined />}
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </div>
      )
    },
  ];

  // 表单验证规则
  const formRules = {
    minAmount: [{
      validator: (_: any, value: number, callback: (error?: string) => void) => {
        const productType = form.getFieldValue('type');
        if (productType === 'full_reduction' && !value) {
          callback('满减券必须设置最低消费金额');
        } else callback();
      }
    }],
    reductionAmount: [{
      validator: (_: any, value: number, callback: (error?: string) => void) => {
        const productType = form.getFieldValue('type');
        if (productType === 'full_reduction' && !value) {
          callback('满减券必须设置减免金额');
        } else callback();
      }
    }],
    discountRate: [{
      validator: (_: any, value: number, callback: (error?: string) => void) => {
        const productType = form.getFieldValue('type');
        if (productType === 'discount') {
          if (!value) {
            callback('折扣券必须设置折扣率');
          } else if (value < 0.1 || value > 1) {
            callback('折扣率必须在0.1-1之间');
          } else callback();
        } else callback();
      }
    }],
    fixedAmount: [{
      validator: (_: any, value: number, callback: (error?: string) => void) => {
        const productType = form.getFieldValue('type');
        if (productType === 'fixed_amount' && !value) {
          callback('固定金额券必须设置固定金额');
        } else callback();
      }
    }],
  };

  return (
    <Layout>
      <Card title="优惠卷管理">
        <div className={styles.couponPage}>
          <div className={styles.header}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              添加优惠卷
            </Button>
          </div>

          <Form form={searchForm} layout="inline" className={styles.searchBar}>
            <Form.Item name="name" label="优惠卷名称">
              <Input placeholder="请输入优惠卷名称" />
            </Form.Item>
            <Form.Item name="type" label="类型">
              <Select placeholder="选择优惠卷类型">
                <Option value="full_reduction">满减券</Option>
                <Option value="discount">折扣券</Option>
                <Option value="fixed_amount">固定金额券</Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select placeholder="选择优惠卷状态">
                <Option value="enabled">启用</Option>
                <Option value="disabled">禁用</Option>
                <Option value="expired">已过期</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleSearch}>
                搜索
              </Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Form.Item>
          </Form>

          <Table
            dataSource={data?.list || []}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: data?.total || 0,
              onChange: (page, pageSize) => {
                setPage(page);
                setPageSize(pageSize);
                fetchCoupons();
              },
            }}
            className={styles.table}
          />

          <Modal
            title={editingCoupon ? '编辑优惠卷' : '添加优惠卷'}
            open={isModalVisible}
            onOk={handleSave}
            onCancel={handleCancel}
            width={800}
            className={styles.modal}
          >
            <Form form={form} layout="vertical" className={styles.form}>
              <Form.Item name="name" label="优惠卷名称" rules={[{ required: true, message: '请输入优惠卷名称' }]}>
                <Input placeholder="请输入优惠卷名称" />
              </Form.Item>
              <Form.Item name="type" label="优惠卷类型" rules={[{ required: true, message: '请选择优惠卷类型' }]}>
                <Select placeholder="选择优惠卷类型">
                  <Option value={CouponTypeMap.ShippingFree}>{CouponTypeToName[CouponTypeMap.ShippingFree]}</Option>
                  <Option value={CouponTypeMap.Discount}>{CouponTypeToName[CouponTypeMap.Discount]}</Option>
                  <Option value={CouponTypeMap.FixedAmount}>{CouponTypeToName[CouponTypeMap.FixedAmount]}</Option>
                </Select>
              </Form.Item>
              <Form.Item name="description" label="优惠卷描述">
                <Input.TextArea placeholder="请输入优惠卷描述" rows={3} />
              </Form.Item>

              <Form.Item noStyle shouldUpdate={(prevValues, nextValues) => prevValues.type !== nextValues.type}>
                {({ getFieldValue }) => {
                  const type = getFieldValue('type');
                  {/* 折扣券配置 */ }
                  if (type === CouponTypeMap.Discount) {
                    return (
                      <Form.Item name="discountRate" label="折扣率" rules={formRules.discountRate}>
                        <InputNumber style={{ width: '100%' }} placeholder="请输入折扣率（如0.8表示8折）" />
                      </Form.Item>
                    )
                  }
                  {/* 固定金额券配置 */ }
                  if (type === CouponTypeMap.FixedAmount) {
                    return (
                      <Form.Item name="fixedAmount" label="固定金额" rules={formRules.fixedAmount}>
                        <InputNumber style={{ width: '100%' }} placeholder="请输入固定金额" />
                      </Form.Item>
                    )
                  }
                  {/* 运费免单券配置 */ }
                  if (type === CouponTypeMap.ShippingFree) {
                    return (
                      <>
                        <Form.Item name="minAmount" label="最低消费金额" rules={formRules.minAmount}>
                          <InputNumber style={{ width: '100%' }} placeholder="请输入最低消费金额" />
                        </Form.Item>
                        <Form.Item name="reductionAmount" label="减免金额" rules={formRules.reductionAmount}>
                          <InputNumber style={{ width: '100%' }} placeholder="请输入减免金额" />
                        </Form.Item>
                      </>
                    )
                  }
                  return null;
                }}
              </Form.Item>

              <Form.Item name="totalQuantity" label="总数量" rules={[{ required: true, message: '请输入总数量' }]}>
                <InputNumber style={{ width: '100%' }} placeholder="请输入总数量" />
              </Form.Item>
              <Form.Item label="有效期" name="time">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Card>
    </Layout>
  );
};

export default CouponPage;
