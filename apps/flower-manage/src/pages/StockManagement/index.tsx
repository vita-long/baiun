import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, InputNumber, Input, Select, message, Typography, Badge, Space } from 'antd';
import { PlusOutlined, HistoryOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getAllProducts, adjustStock, getStockHistory } from '@/service/stock';
import { ProductTypeMap, type Product } from '@/types/product';
import type { AdjustStockRequest, StockHistory, StockAdjustmentType } from '@/types/stock';
import Layout from '@/components/Layout';
import styles from './index.module.less';

const { Title, Text } = Typography;
const { Option } = Select;

const StockManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [adjustModalVisible, setAdjustModalVisible] = useState<boolean>(false);
  const [historyModalVisible, setHistoryModalVisible] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [lowStockProducts] = useState<Product[]>([]);
  const [form] = Form.useForm<AdjustStockRequest>();

  // 获取产品列表
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getAllProducts({ page: 1, pageSize: 100 });
      setProducts(response.list);
    } catch (error) {
      message.error('获取产品列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取库存历史记录
  const fetchStockHistory = async (productId: string) => {
    try {
      const response = await getStockHistory(productId, { page: 1, pageSize: 50 });
      setStockHistory(response.list);
    } catch (error) {
      message.error('获取库存历史记录失败');
    }
  };

  // 打开调整库存弹窗
  const handleAdjustStock = (product: Product) => {
    setSelectedProduct(product);
    // form.resetFields();
    setAdjustModalVisible(true);
  };

  // 打开库存历史记录弹窗
  const handleViewHistory = (product: Product) => {
    setSelectedProduct(product);
    fetchStockHistory(product.productId);
    setHistoryModalVisible(true);
  };

  // 提交库存调整
  const handleAdjustSubmit = async (values: AdjustStockRequest) => {
    if (!selectedProduct) return;

    try {
      await adjustStock(selectedProduct.productId, values);
      message.success('库存调整成功');
      setAdjustModalVisible(false);
      fetchProducts();
    } catch (error) {
      message.error('库存调整失败');
    }
  };

  // 库存类型标签
  const getStockTypeLabel = (type: StockAdjustmentType) => {
    const labels = {
      purchase: '采购入库',
      sale: '销售出库',
      adjustment: '库存调整'
    };
    return labels[type];
  };

  // 表格列定义
  const columns = [
    {
      title: '产品ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 220,
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 400,
    },
    {
      title: '当前库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 200,
      render: (stock: number, record: Product) => {
        const isLowStock = lowStockProducts.some(item => item.productId === record.productId);
        return (
          <Badge status={isLowStock ? 'error' : 'success'}>
            {stock}
            {isLowStock && <Text type="danger"> (低库存)</Text>}
          </Badge>
        );
      },
    },
    {
      title: '价格',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (price: number, record: Product) => {
        let res = record.productType === ProductTypeMap.Normal ?
          (price ? `¥${price}` : 0) : (`${record.pointsPrice}积分`);
        return res;
      },
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: any, record: Product) => (
        <Space size="middle" vertical>
          <Button
            type="primary"
            size="small"
            onClick={() => handleAdjustStock(record)}
            icon={<PlusOutlined />}
          >
            调整库存
          </Button>
          <Button
            size="small"
            onClick={() => handleViewHistory(record)}
            icon={<HistoryOutlined />}
          >
            库存历史
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Layout>
      <div className={styles.contentWrapper}>
        <div className={styles.contentHeader}>
          <Title level={2}>库存管理</Title>
        </div>

        {/* 低库存警告 */}
        {lowStockProducts.length > 0 && (
          <Card
            className={styles.warningCard}
            title={<Text type="danger">低库存警告</Text>}
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Text type="danger">
              <ExclamationCircleOutlined /> 以下 {lowStockProducts.length} 个产品库存不足，请及时处理：
            </Text>
            <div style={{ marginTop: 8 }}>
              {lowStockProducts.map(product => (
                <Badge key={product.productId} status="error" text={product.name} style={{ marginRight: 8 }} />
              ))}
            </div>
          </Card>
        )}

        {/* 产品库存列表 */}
        <Card title="产品库存列表">
          <Table
            columns={columns}
            dataSource={products}
            rowKey="productId"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>

        {/* 调整库存弹窗 */}
        <Modal
          title={`调整产品库存: ${selectedProduct?.name}`}
          open={adjustModalVisible}
          onCancel={() => setAdjustModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAdjustSubmit}
          >
            <Form.Item label="当前库存" name="currentStock">
              <Text type="secondary">{selectedProduct?.stock}</Text>
            </Form.Item>
            <Form.Item
              name="changeQuantity"
              label="调整数量"
              rules={[{ required: true, message: '请输入调整数量' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="输入正数增加库存，负数减少库存"
                step={1}
              />
            </Form.Item>
            <Form.Item
              name="type"
              label="调整类型"
              rules={[{ required: true, message: '请选择调整类型' }]}
            >
              <Select placeholder="请选择调整类型">
                <Option value="purchase">采购入库</Option>
                <Option value="sale">销售出库</Option>
                <Option value="adjustment">库存调整</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="operator"
              label="操作人"
            >
              <Input style={{ width: '100%' }} placeholder="请输入操作人" />
            </Form.Item>
            <Form.Item
              name="remark"
              label="备注"
            >
              <Input.TextArea rows={3} placeholder="请输入备注信息" />
            </Form.Item>
            <Form.Item style={{ textAlign: 'right' }}>
              <Button onClick={() => setAdjustModalVisible(false)} style={{ marginRight: 8 }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确认调整
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* 库存历史记录弹窗 */}
        <Modal
          title={`库存历史记录: ${selectedProduct?.name}`}
          open={historyModalVisible}
          onCancel={() => setHistoryModalVisible(false)}
          footer={null}
          width={800}
        >
          <Table
            columns={[
              {
                title: '调整时间',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (time: string) => new Date(time).toLocaleString(),
              },
              {
                title: '调整类型',
                dataIndex: 'type',
                key: 'type',
                render: (type: StockAdjustmentType) => getStockTypeLabel(type),
              },
              {
                title: '调整前库存',
                dataIndex: 'beforeStock',
                key: 'beforeStock',
              },
              {
                title: '调整后库存',
                dataIndex: 'afterStock',
                key: 'afterStock',
              },
              {
                title: '调整数量',
                dataIndex: 'changeQuantity',
                key: 'changeQuantity',
                render: (quantity: number) => (
                  <Text type={quantity > 0 ? 'success' : 'danger'}>
                    {quantity > 0 ? '+' : ''}{quantity}
                  </Text>
                ),
              },
              {
                title: '操作人',
                dataIndex: 'operator',
                key: 'operator',
              },
              {
                title: '备注',
                dataIndex: 'remark',
                key: 'remark',
              },
            ]}
            dataSource={stockHistory}
            rowKey="id"
            pagination={false}
          />
        </Modal>
      </div>
    </Layout>
  );
};

export default StockManagement;
