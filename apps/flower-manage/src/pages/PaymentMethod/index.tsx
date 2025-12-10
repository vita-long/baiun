import React, { useState, useEffect } from 'react';
import { useRequest } from 'ahooks';
import { Button, Table, Modal, Form, Input, Switch, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Layout from '@/components/Layout';
import type { PaymentMethod } from '@/types/paymentMethod';
import { createPaymentMethod, deletePaymentMethod, getPaymentMethods, updatePaymentMethod } from '@/service/paymentMethod';
import styles from './index.module.less';

const PaymentMethod: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [form] = Form.useForm();
  const [page] = useState(1);
  const [pageSize] = useState(10);

  const { data: paymentMethods, run: fetchPaymentMethod, loading } = useRequest(() => getPaymentMethods({
    page,
    pageSize,
  }), { manual: true });

  useEffect(() => {
    fetchPaymentMethod();
  }, [page, pageSize, fetchPaymentMethod]);

  const handleAddPaymentMethod = () => {
    setEditingPaymentMethod(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditPaymentMethod = (paymentMethod: PaymentMethod) => {
    setEditingPaymentMethod(paymentMethod);
    form.setFieldsValue({
      paymentName: paymentMethod.paymentName,
      description: paymentMethod.description || '',
      isEnabled: paymentMethod.isEnabled,
    });
    setIsModalOpen(true);
  };

  const handleDeletePaymentMethod = async (paymentId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个支付方式吗？',
      onOk: async () => {
        try {
          await deletePaymentMethod(paymentId);
          message.success('删除成功');
          fetchPaymentMethod();
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = form.getFieldsValue();

      if (editingPaymentMethod) {
        // 编辑模式
        await updatePaymentMethod(editingPaymentMethod.paymentId, values);
        message.success('更新成功');
      } else {
        await createPaymentMethod(values);
        message.success('创建成功');
      }

      setIsModalOpen(false);
      fetchPaymentMethod();
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '支付方式名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '是否启用',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      render: (isEnabled: boolean) => (
        <Switch checked={isEnabled} disabled />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: PaymentMethod) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditPaymentMethod(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePaymentMethod(record.paymentId)}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <Layout>
      <div className={styles.contentWrapper}>
        <div className={styles.contentHeader}>
          <h2>支付方式管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPaymentMethod}>
            新建支付方式
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={paymentMethods ?? []}
          rowKey="paymentId"
          loading={loading}
          pagination={false}
        />
      </div>

      {/* 支付方式编辑弹窗 */}
      <Modal
        title={editingPaymentMethod ? '编辑支付方式' : '新建支付方式'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isEnabled: true
          }}
        >
          <Form.Item
            name="name"
            label="支付方式名称"
            rules={[{ required: true, message: '请输入支付方式名称' }]}
          >
            <Input placeholder="请输入支付方式名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={4} placeholder="请输入支付方式描述" />
          </Form.Item>

          <Form.Item
            name="isEnabled"
            label="是否启用"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default PaymentMethod;
