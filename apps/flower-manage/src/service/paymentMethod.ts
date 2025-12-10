import type { PaymentMethod, PaymentMethodCreateRequest, PaymentMethodUpdateRequest } from '@/types/paymentMethod';
import { request } from './index';

// 获取支付方式列表
export const getPaymentMethods = async (params?: {
  page?: number;
  pageSize?: number;
}): Promise<PaymentMethod[]> => {
  return request.get('/paymentMethods', { params });
};

// 创建支付方式
export const createPaymentMethod = async (data: PaymentMethodCreateRequest): Promise<PaymentMethod> => {
  return request.post('/paymentMethods', data);
};

// 更新支付方式
export const updatePaymentMethod = async (paymentId: string, data: PaymentMethodUpdateRequest): Promise<PaymentMethod> => {
  return request.put(`/paymentMethods/${paymentId}`, data);
};

// 删除支付方式
export const deletePaymentMethod = async (id: string): Promise<void> => {
  return request.delete(`/paymentMethods/${id}`);
};

// 获取支付方式详情
export const getPaymentMethodDetail = async (id: string): Promise<PaymentMethod> => {
  return request.get(`/paymentMethods/${id}`);
};
