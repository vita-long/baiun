import React from 'react';
import { Button } from '../src';
import { Space } from 'antd';

const ButtonExample: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Button 组件示例</h2>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <div>
          <h3>基本按钮</h3>
          <Space>
            <Button type="primary">主按钮</Button>
            <Button>默认按钮</Button>
            <Button type="dashed">虚线按钮</Button>
            <Button type="text">文本按钮</Button>
            <Button type="link">链接按钮</Button>
          </Space>
        </div>

        <div>
          <h3>按钮尺寸</h3>
          <Space>
            <Button type="primary" size="large">大号按钮</Button>
            <Button type="primary" size="middle">中号按钮</Button>
            <Button type="primary" size="small">小号按钮</Button>
          </Space>
        </div>

        <div>
          <h3>禁用状态</h3>
          <Space>
            <Button type="primary" disabled>禁用主按钮</Button>
            <Button disabled>禁用默认按钮</Button>
            <Button type="text" disabled>禁用文本按钮</Button>
            <Button type="link" disabled>禁用链接按钮</Button>
          </Space>
        </div>

        <div>
          <h3>带图标按钮</h3>
          <Space>
            <Button type="primary" icon={<span>🔍</span>}>搜索</Button>
            <Button type="primary" icon={<span>➕</span>}>添加</Button>
            <Button icon={<span>📝</span>}>编辑</Button>
            <Button danger icon={<span>🗑️</span>}>删除</Button>
          </Space>
        </div>

        <div>
          <h3>加载中状态</h3>
          <Space>
            <Button type="primary" loading>加载中</Button>
            <Button type="primary" loading>
              加载中
            </Button>
            <Button loading>加载中</Button>
            <Button danger loading>加载中</Button>
          </Space>
        </div>

        <div>
          <h3>按钮形状</h3>
          <Space>
            <Button type="primary">默认形状</Button>
            <Button type="primary" shape="round">圆形按钮</Button>
            <Button type="primary" shape="circle" icon={<span>🔍</span>} />
          </Space>
        </div>

        <div>
          <h3>危险按钮</h3>
          <Space>
            <Button danger>危险按钮</Button>
            <Button type="primary" danger>危险主按钮</Button>
            <Button danger type="dashed">危险虚线按钮</Button>
            <Button danger type="text">危险文本按钮</Button>
          </Space>
        </div>
      </Space>
    </div>
  );
};

export default ButtonExample;
