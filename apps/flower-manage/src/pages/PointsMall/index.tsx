import React, { useState, useEffect } from 'react';
import { useRequest } from 'ahooks';
import { Button, Table, Modal, Form, Input, Upload, Select, Switch, message, Space, InputNumber, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import { getCategories } from '@/service/category';
import type { UploadProps } from 'antd';
import { ProductTypeMap, type Product } from '@/types/product';
import Layout from '@/components/Layout';
import styles from './index.module.less';
import { createProduct, deleteProduct, getProducts, updateProduct, uploadImage } from '@/service/product';

const PointsMall: React.FC = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [page] = useState(1);
  const [pageSize] = useState(10);

  const { data: categories } = useRequest(getCategories);
  const { data: products, run: fetchProduct, loading } = useRequest(() => getProducts({
    page,
    pageSize,
    productType: ProductTypeMap.Points
  }), { manual: true });

  useEffect(() => {
    fetchProduct();
  }, [page, pageSize, fetchProduct]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    form.resetFields();
    // 设置初始值为空数组和积分商品类型
    form.setFieldsValue({
      mainImage: [],
      productType: 'points'
    });
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      mainImage: [{
        uid: `main-${product.productId}`,
        name: `main-${product.productId}`,
        status: 'done' as const,
        url: product.mainImage
      }],
      categoryId: product.categoryId,
      productType: product.productType,
      pointsPrice: product.pointsPrice,
      isActive: product.isActive,
      description: product.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个积分商品吗？',
      onOk: async () => {
        try {
          await deleteProduct(productId);
          message.success('删除成功');
          fetchProduct();
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
      // 处理图片数据
      const mainImage = values.mainImage?.[0]?.url || '';

      const productData = {
        ...values,
        mainImage,
        productType: 'points' // 确保始终是积分商品
      };
      if (editingProduct) {
        // 编辑模式
        await updateProduct(editingProduct.productId, productData);
        fetchProduct();
        message.success('更新成功');
      } else {
        await createProduct(productData);
        fetchProduct();
        message.success('创建成功');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败');
    }
  };

  // 主图上传配置
  const mainImageUploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    listType: 'picture-card',
    customRequest: async (options) => {
      const { file, onSuccess, onError } = options;
      try {
        // 调用上传接口
        const res = await uploadImage(file as File);

        // 处理上传成功
        if (res && res.url) {
          onSuccess?.(res, file);
          message.success('图片上传成功');
        } else {
          throw new Error('上传失败：未返回图片URL');
        }
      } catch (error) {
        console.error('图片上传失败:', error);
        if (onError) {
          onError(error as any, file);
        }
        message.error('图片上传失败，请重试');
      }
    },
    beforeUpload: (file) => {
      // 验证文件类型
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件！');
        return Upload.LIST_IGNORE;
      }

      // 验证文件大小（限制为 2MB）
      const isLessThan2MB = file.size / 1024 / 1024 < 2;
      if (!isLessThan2MB) {
        message.error('图片大小不能超过 2MB！');
        return Upload.LIST_IGNORE;
      }

      return true;
    },
    onChange: (info) => {
      // 确保fileList始终是数组
      const fileList = Array.isArray(info.fileList) ? info.fileList : [];

      // 处理上传完成的文件，确保结构正确
      const processedFileList = fileList.map(file => {
        if (file.status === 'done' && file.response && file.response.url) {
          // 确保返回包含完整信息的文件对象
          return {
            uid: file.uid,
            name: file.name,
            status: 'done' as const,
            url: file.response.url
          };
        }
        return file;
      });

      // 更新表单数据
      form.setFieldValue('mainImage', processedFileList);
    },
  };

  const columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '主图',
      dataIndex: 'mainImage',
      key: 'mainImage',
      render: (url: string) => <img src={url} alt="主图" style={{ width: 60, height: 60 }} />,
    },
    {
      title: '商品分类',
      key: 'categoryName',
      render: (_: any, record: Product) => record?.category?.categoryName || '',
    },
    {
      title: '积分价格',
      dataIndex: 'pointsPrice',
      key: 'pointsPrice',
      render: (pointsPrice: number) => pointsPrice ? `${pointsPrice}积分` : '-',
    },
    {
      title: '是否上架',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Switch checked={isActive} disabled />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Product) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditProduct(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteProduct(record.productId)}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <Layout>
      <Card title="积分商城管理">
        <div className={styles.contentWrapper}>
          <div className={styles.contentHeader}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProduct}>
              新建积分商品
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={products?.list ?? []}
            rowKey="productId"
            loading={loading}
            pagination={{
              current: page,
              pageSize,
              total: products?.total ?? 0,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </div>
      </Card>

      {/* 商品编辑弹窗 */}
      <Modal
        title={editingProduct ? '编辑积分商品' : '新建积分商品'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            mainImage: [],
            images: [],
            productType: 'points',
            isActive: false
          }}
        >
          <Form.Item
            name="name"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>

          <Form.Item
            name="mainImage"
            label="商品主图"
            rules={[{ required: true, message: '请上传商品主图' }]}
            valuePropName="fileList"
          >
            <Upload
              {...mainImageUploadProps}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
            </Upload>
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="商品分类"
            rules={[{ required: true, message: '请选择商品分类' }]}
          >
            <Select placeholder="请选择商品分类">
              {categories?.map(cat => (
                <Select.Option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="pointsPrice"
            label="积分价格"
            rules={[{ required: true, message: '请输入积分价格' }]}
          >
            <InputNumber style={{ width: '200px' }} placeholder="请输入积分价格" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="是否上架"
            initialValue={false}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="description"
            label="商品描述"
          >
            <Input.TextArea rows={6} placeholder="请输入商品描述" />
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

export default PointsMall;