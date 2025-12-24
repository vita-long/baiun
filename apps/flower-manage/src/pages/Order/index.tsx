import React, { useState, useEffect } from 'react';
import { useRequest } from 'ahooks';
import { Button, Table, Modal, Form, Input, Select, message, Space, Tag } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { Order, OrderListRequest } from '@/types/order';
import Layout from '@/components/Layout';
import styles from './index.module.less';
import { getOrders, updateOrderStatus, getOrderDetail } from '@/service/order';

const OrderPage: React.FC = () => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState<OrderListRequest>({ page, pageSize });
  const [form] = Form.useForm();

  // 获取订单列表
  const { data: orders, run: fetchOrders, loading } = useRequest(() => getOrders(searchParams), { manual: true });

  // 初始加载数据
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 分页变化时更新请求参数
  useEffect(() => {
    setSearchParams(prev => ({ ...prev, page, pageSize }));
  }, [page, pageSize]);

  // 搜索参数变化时重新获取数据
  useEffect(() => {
    fetchOrders();
  }, [searchParams, fetchOrders]);

  // 查看订单详情
  const handleViewOrderDetail = async (id: string) => {
    try {
      const order = await getOrderDetail(id);
      setSelectedOrder(order);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('获取订单详情失败:', error);
      message.error('获取订单详情失败');
    }
  };

  // 更新订单状态
  const handleUpdateStatus = async () => {
    try {
      if (!selectedOrder) return;
      const values = form.getFieldsValue();
      await updateOrderStatus(selectedOrder.id, values);
      message.success('订单状态更新成功');
      setSelectedOrder(prev => prev ? { ...prev, status: values.status } : null);
      fetchOrders();
    } catch (error) {
      console.error('更新订单状态失败:', error);
      message.error('更新订单状态失败');
    }
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    setSearchParams({ page: 1, pageSize });
  };

  // 状态标签颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '待支付':
        return 'orange';
      case '已支付':
        return 'blue';
      case '已发货':
        return 'purple';
      case '已完成':
        return 'green';
      case '已取消':
        return 'red';
      default:
        return 'default';
    }
  };

  // 订单列表列配置
  const columns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      width: 160,
    },
    {
      title: '用户信息',
      key: 'userInfo',
      render: (_: any, record: Order) => (
        <div>
          <div>{record.userName}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>{record.userPhone}</div>
        </div>
      ),
    },
    {
      title: '订单金额',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (totalPrice: number) => `¥${totalPrice.toFixed(2)}`,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (createdAt: string) => new Date(createdAt).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Order) => (
        <>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewOrderDetail(record.id)}
          >
            详情
          </Button>
        </>
      ),
    },
  ];

  // 订单项列配置
  const orderItemColumns = [
    {
      title: '商品图片',
      dataIndex: 'productImage',
      key: 'productImage',
      width: 80,
      render: (url: string) => <img src={url} alt="商品图片" style={{ width: 60, height: 60 }} />,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '小计',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (totalPrice: number) => `¥${totalPrice.toFixed(2)}`,
    },
  ];

  return (
    <Layout>
      <div className={styles.contentWrapper}>
        <div className={styles.contentHeader}>
          <h2>订单管理</h2>
        </div>

        {/* 搜索表单 */}
        <Form
          form={form}
          className={styles.searchForm}
          layout="inline"
          initialValues={searchParams}
          onValuesChange={(_, allValues) => {
            setSearchParams(prev => ({ ...prev, ...allValues, page: 1 }));
          }}
        >
          <Form.Item name="id" label="订单号" className={styles.formItem}>
            <Input placeholder="请输入订单号" />
          </Form.Item>
          <Form.Item name="userName" label="用户名称" className={styles.formItem}>
            <Input placeholder="请输入用户名称" />
          </Form.Item>
          <Form.Item name="status" label="订单状态" className={styles.formItem}>
            <Select placeholder="请选择订单状态">
              <Select.Option value="待支付">待支付</Select.Option>
              <Select.Option value="已支付">已支付</Select.Option>
              <Select.Option value="已发货">已发货</Select.Option>
              <Select.Option value="已完成">已完成</Select.Option>
              <Select.Option value="已取消">已取消</Select.Option>
            </Select>
          </Form.Item>
          <Space>
            <Button type="primary" onClick={fetchOrders}>查询</Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form>

        {/* 订单列表 */}
        <Table
          columns={columns}
          dataSource={orders?.list ?? []}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total: orders?.total ?? 0,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (current, size) => {
              setPage(current);
              if (size) setPageSize(size);
            },
          }}
        />
      </div>

      {/* 订单详情弹窗 */}
      <Modal
        title="订单详情"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={900}
        className={styles.detailModal}
      >
        {selectedOrder && (
          <div>
            {/* 订单基本信息 */}
            <div className={styles.orderInfo}>
              <h3>订单信息</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '12px' }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>订单号：</span>{selectedOrder.id}
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>用户名称：</span>{selectedOrder.userName}
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>联系电话：</span>{selectedOrder.userPhone}
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>收货地址：</span>{selectedOrder.address}
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>订单金额：</span>¥{selectedOrder.totalPrice.toFixed(2)}
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>订单状态：</span>
                  <Tag color={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Tag>
                </div>
                <div>
                  <span style={{ fontWeight: 'bold' }}>创建时间：</span>{new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
              </div>

              {/* 订单状态更新 */}
              <Form
                layout="inline"
                style={{ marginTop: '16px' }}
                initialValues={{ status: selectedOrder.status }}
                onValuesChange={(values) => form.setFieldsValue(values)}
              >
                <Form.Item name="status" label="更新状态">
                  <Select placeholder="请选择订单状态">
                    <Select.Option value="待支付">待支付</Select.Option>
                    <Select.Option value="已支付">已支付</Select.Option>
                    <Select.Option value="已发货">已发货</Select.Option>
                    <Select.Option value="已完成">已完成</Select.Option>
                    <Select.Option value="已取消">已取消</Select.Option>
                  </Select>
                </Form.Item>
                <Button type="primary" onClick={handleUpdateStatus}>
                  更新状态
                </Button>
              </Form>
            </div>

            {/* 订单项列表 */}
            <div className={styles.orderItems}>
              <h3>商品列表</h3>
              <Table
                columns={orderItemColumns}
                dataSource={selectedOrder.orderItems}
                rowKey="orderItemId"
                pagination={false}
                style={{ marginTop: '16px' }}
              />
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default OrderPage;