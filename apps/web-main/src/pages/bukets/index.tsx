import React, { useState } from 'react';
import { Table, Button, message, Card, Typography, Modal, Space, Empty, Spin } from 'antd';
import { DeleteOutlined, EyeOutlined, ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { PaginationProps } from 'antd/es/pagination';
import { request } from '@/service';

const { Text } = Typography;
const { confirm } = Modal;

// 定义图片资源的接口
interface ImageResource {
  id: string;
  resourceId: string;
  name: string;
  path: string;
  size: number;
  type: string;
  mimetype: string;
  updatedAt: string;
}

// 格式化文件大小
const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

const BucketsPage: React.FC = () => {
  const [imageData, setImageData] = useState<ImageResource[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // 处理选择行变化
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const generateMockImageData = async () => {
    const res = await request.get<{ list: ImageResource[], total: number }>('/upload/images');
    console.log(res);

    setImageData(res?.list || []);
    setTotal(res?.total || 0);
  };

  React.useEffect(() => {
    generateMockImageData();
  }, [])

  // 批量删除功能
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的图片');
      return;
    }

    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 张图片吗？此操作不可恢复。`,
      onOk: async () => {
        setLoading(true);
        await request.delete(`/upload/files/batch`, {
          data: {
            resourceIds: selectedRowKeys,
          }
        });
        setLoading(false);
        generateMockImageData();
        setSelectedRowKeys([]);
      },
    });
  };

  // 单个删除功能
  const handleSingleDelete = (resourceId: string) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这张图片吗？此操作不可恢复。',
      onOk: async () => {
        setLoading(true);
        await request.delete(`/upload/file/${resourceId}`);
        generateMockImageData();
        setLoading(false);
        message.success('图片删除成功');
      },
    });
  };

  // 预览图片
  const handlePreview = (url: string) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  // 处理分页变化
  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
    setSelectedRowKeys([]); // 切换页面前清空选择
  };

  // 表格的选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // 表格列配置
  const columns: ColumnsType<ImageResource> = [
    {
      title: '图片预览',
      dataIndex: 'path',
      key: 'path',
      width: 100,
      render: (path: string) => (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 80,
              height: 60,
              overflow: 'hidden',
              borderRadius: 4,
              cursor: 'pointer',
              margin: '0 auto',
              border: '1px solid #f0f0f0'
            }}
            onClick={() => handlePreview(path)}
          >
            <img
              src={path}
              alt="预览"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      ),
    },
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '文件类型',
      dataIndex: 'mimetype',
      key: 'mimetype',
      width: 120,
      render: (mimetype: string) => (
        <Text type="secondary">{mimetype}</Text>
      ),
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '上传时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record.path)}
            size="small"
          >
            预览
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleSingleDelete(record.resourceId)}
            size="small"
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 分页配置
  const paginationConfig: PaginationProps = {
    current: currentPage,
    pageSize: pageSize,
    total: total,
    onChange: handlePageChange,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 张图片`,
    pageSizeOptions: ['10', '20', '50', '100'],
  };

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
            <UploadOutlined style={{ marginRight: 8 }} />
            图片资源管理
          </div>
        }
        extra={
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
            loading={loading}
          >
            批量删除 ({selectedRowKeys.length})
          </Button>
        }
        style={{ marginBottom: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
      >
        {loading && imageData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <Spin tip="加载中..." />
          </div>
        ) : imageData.length === 0 ? (
          <Empty
            description="暂无图片资源"
            style={{ padding: 80 }}
          />
        ) : (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={imageData}
            rowKey="resourceId"
            pagination={paginationConfig}
            loading={loading}
            rowClassName={(record) => selectedRowKeys.includes(record.resourceId) ? 'selected-row' : ''}
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>

      {/* 图片预览弹窗 */}
      <Modal
        title="图片预览"
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <img
          alt="预览图片"
          style={{
            width: '100%',
            maxHeight: 'calc(100vh - 200px)',
            objectFit: 'contain'
          }}
          src={previewImage}
        />
      </Modal>

      {/* 选中行样式通过rowClassName直接设置 */}
    </div>
  );
};

export default BucketsPage;