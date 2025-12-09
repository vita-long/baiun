import { Upload as AntUpload } from 'antd';
import type { UploadProps as AntUploadProps } from 'antd';

export interface UploadProps extends AntUploadProps {
  // 可以在这里扩展自定义属性
}

export const Upload: React.FC<UploadProps> = (props) => {

  return (
    <AntUpload {...props} />
  )
}
