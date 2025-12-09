import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Category } from '@/types/category';
import Layout from '@/components/Layout';
import styles from './index.module.less';
import { createCategory, deleteCategory, getCategories, updateCategory } from '@/service/category';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();



  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res || []);
      setLoading(false);
    } catch (error) {
      console.error('获取分类失败:', error);
      message.error('获取分类失败');
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      description: category.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个分类吗？',
      onOk: async () => {
        try {
          await deleteCategory(categoryId);
          fetchCategories();
          message.success('删除成功');
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

      if (editingCategory) {
        const { categoryId, ...others } = values;
        await updateCategory(categoryId, others);
        fetchCategories();
        message.success('更新成功');
      } else {
        await createCategory(values);
        fetchCategories();
        message.success('创建成功');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '分类名称',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Category) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditCategory(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteCategory(record.categoryId)}
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
          <h2>分类管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
            添加分类
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </div>
      <Modal
        title={editingCategory ? '编辑分类' : '添加分类'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="categoryId"
            label="categoryId"
            hidden
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="categoryName"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="分类描述"
          >
            <Input.TextArea rows={4} placeholder="请输入分类描述" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              确定
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Categories;