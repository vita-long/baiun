import { request } from './index';
import type { AdjustStockRequest, StockHistoryResponse, LowStockProductsResponse } from '@/types/stock';
import type { Product, ProductListResponse } from '@/types/product';

// 获取所有产品（包含库存信息）
export const getAllProducts = async (params?: {
  page?: number;
  pageSize?: number;
}): Promise<ProductListResponse> => {
  return request.get('/products', { params });
};

// 根据ID获取单个产品
export const getProduct = async (productId: string): Promise<Product> => {
  return request.get(`/products/${productId}`);
};

// 调整产品库存
export const adjustStock = async (productId: string, data: AdjustStockRequest): Promise<{ message: string }> => {
  return request.post(`/products/${productId}/stock/adjust`, data);
};

// 获取产品库存历史记录
export const getStockHistory = async (productId: string, params?: {
  page?: number;
  pageSize?: number;
}): Promise<StockHistoryResponse> => {
  return request.get(`/products/${productId}/stock/history`, { params });
};

// 获取低库存产品列表
export const getLowStockProducts = async (params?: {
  threshold?: number;
  page?: number;
  pageSize?: number;
}): Promise<LowStockProductsResponse> => {
  return request.get('/products/low-stock', { params });
};
