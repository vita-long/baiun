import { useState, useEffect } from 'react';
import { Upload, message, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import styles from './index.module.less';

const Ico = () => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  // 处理文件上传前的验证
  const beforeUpload = (file: File) => {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('文件大小不能超过2MB!');
      return Upload.LIST_IGNORE;
    }

    return false; // 阻止自动上传
  };
  // 处理文件变化
  const handleChange = async ({ fileList: newFileList }: { fileList: any[] }) => {
    setFileList(newFileList);

    // 检查是否有新添加的文件
    const newFile = newFileList.find(file => file.status === 'uploading' || file.status === 'done');
    console.log(newFileList)
    if (newFile) {
      setIsLoading(true);
      try {
        // 为上传的文件创建预览URL
        if (newFile.originFileObj) {
          const previewUrl = URL.createObjectURL(newFile.originFileObj);
          setPreviewImage(previewUrl);
        }
      } catch (error) {
        message.error('预览失败');
        console.error('Preview error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    // 如果文件列表为空，清除预览
    if (newFileList.length === 0) {
      setPreviewImage(null);
    }
  };

  // 清理URL对象
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // 自定义上传组件
  const uploadButton = (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>点击上传</div>
    </div>
  );

  return (
    <div className={styles.container}>
      <h2>ICO文件上传与预览</h2>
      <Upload
        name="ico"
        listType="picture-card"
        fileList={fileList}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        customRequest={() => { }}
      >
        {fileList.length >= 1 ? null : uploadButton}
      </Upload>

      {isLoading && (
        <div className={styles.loading}>
          处理中...
        </div>
      )}

      {previewImage && (
        <div className={styles.previewContainer}>
          <Card title="预览" className={styles.previewCard}>
            <img
              src={previewImage}
              alt="ICO预览"
              className={styles.previewImage}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default Ico;
