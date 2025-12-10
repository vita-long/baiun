import { request } from '.';
import type { Order, OrderListRequest, OrderListResponse, UpdateOrderStatusRequest } from '@/types/order';

// 获取订单列表
export const getOrders = async (params: OrderListRequest): Promise<OrderListResponse> => {
  return request.get('/orders', { params });
};

// 获取订单详情
export const getOrderDetail = async (orderId: string): Promise<Order> => {
  return request.get(`/orders/${orderId}`);
};

// 更新订单状态
export const updateOrderStatus = async (orderId: string, data: UpdateOrderStatusRequest): Promise<Order> => {
  return request.put(`/orders/${orderId}/status`, data);
};
