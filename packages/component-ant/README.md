# @baiun/component-ant

基于 Ant Design 的 UI 组件库。

## 安装

```bash
pnpm add @baiun/component-ant
```

## 组件列表

### Button

基于 Ant Design Button 的封装组件，支持所有 Ant Design Button 的属性。

#### 基本使用

```tsx
import React from 'react';
import { Button } from '@baiun/component-ant';

const App: React.FC = () => {
  return (
    <div>
      <Button type="primary">主按钮</Button>
      <Button>默认按钮</Button>
      <Button type="dashed">虚线按钮</Button>
      <Button type="text">文本按钮</Button>
      <Button type="link">链接按钮</Button>
    </div>
  );
};

export default App;
```

#### 属性说明

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| type | `primary` \| `default` \| `dashed` \| `text` \| `link` | 按钮类型 | `default` |
| size | `large` \| `middle` \| `small` | 按钮尺寸 | `middle` |
| disabled | `boolean` | 是否禁用 | `false` |
| loading | `boolean` | 是否加载中 | `false` |
| shape | `default` \| `round` \| `circle` | 按钮形状 | `default` |
| danger | `boolean` | 是否危险按钮 | `false` |
| icon | `ReactNode` | 按钮图标 | - |
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | 点击事件 | - |

支持所有 [Ant Design Button](https://ant.design/components/button-cn/) 的属性。

## 查看示例

### 本地运行示例

1. 进入项目根目录：
```bash
cd /Users/ice/Desktop/codes/baiun
```

2. 安装依赖：
```bash
pnpm install
```

3. 构建组件库：
```bash
pnpm --filter @baiun/component-ant build
```

4. 在项目中使用示例：
```tsx
import ButtonExample from '@baiun/component-ant/examples/ButtonExample';

const App: React.FC = () => {
  return <ButtonExample />;
};
```

## 开发

```bash
# 安装依赖
pnpm install

# 构建组件库
pnpm --filter @baiun/component-ant build

# 运行测试
pnpm --filter @baiun/component-ant test
```
