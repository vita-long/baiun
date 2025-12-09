import React, { useState, useEffect } from 'react';
import { useRequest } from 'ahooks';
import { Button, Table, Modal, Form, Input, Upload, Select, Switch, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import { getCategories } from '@/service/category';
import type { UploadProps } from 'antd';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import Layout from '@/components/Layout';
import styles from './index.module.less';
import { createProduct, deleteProduct, getProducts, updateProduct, uploadImage } from '@/service/product';

const Products: React.FC = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: categories } = useRequest(getCategories);
  const { data: products, run: fetchProduct, loading } = useRequest(() => getProducts({
    page,
    pageSize,
  }), { manual: true });

  useEffect(() => {
    fetchProduct();
  }, [page, pageSize, fetchProduct]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    form.resetFields();
    // 设置初始值为空数组
    form.setFieldsValue({
      mainImage: [],
      images: []
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
      images: (product.images || []).map((url, index) => ({
        uid: `sub-${product.productId}-${index}`,
        name: `sub-${product.productId}-${index}`,
        status: 'done' as const,
        url
      })),
      categoryId: product.categoryId,
      isActive: product.isActive,
      description: product.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个商品吗？',
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
      const images = values.images?.map((file: { url: string }) => file.url) || [];

      const productData = {
        ...values,
        mainImage,
        images,
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

  // 副图上传配置
  const subImagesUploadProps: UploadProps = {
    name: 'file',
    multiple: true,
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
      form.setFieldValue('images', processedFileList);
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
      <div className={styles.contentWrapper}>
        <div className={styles.contentHeader}>
          <h2>商品管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProduct}>
            新建商品
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

      {/* 商品编辑弹窗 */}
      <Modal
        title={editingProduct ? '编辑商品' : '新建商品'}
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
            name="images"
            label="商品副图"
            valuePropName="fileList"
          >
            <Upload.Dragger
              {...subImagesUploadProps}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">可以上传多张图片</p>
            </Upload.Dragger>
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

export default Products;