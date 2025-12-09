import React from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';

export interface ButtonProps extends AntButtonProps {
  // 可以在这里扩展自定义属性
}

export const Button: React.FC<ButtonProps> = (props) => {
  return <AntButton {...props} />;
};
