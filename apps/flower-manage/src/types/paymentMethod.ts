// 支付方式类型定义
export interface PaymentMethod {
  id: string;
  code: string;
  paymentName: string;
  description?: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// 支付方式创建/编辑请求
export interface PaymentMethodCreateRequest {
  name: string;
  description?: string;
  isEnabled: boolean;
}

export interface PaymentMethodUpdateRequest {
  paymentName: string;
  description?: string;
  isEnabled: boolean;
}
