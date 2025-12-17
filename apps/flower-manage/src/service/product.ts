import type { Product, ProductCreateRequest, ProductUpdateRequest } from '@/types/product';
import type { StockHistoryResponse } from '@/types/stock';
import { request } from './index';

// 获取商品列表
export const getProducts = async (params?: {
  page?: number;
  pageSize?: number;
  productType: string;
}): Promise<{ list: Product[]; total: number; page: number; pageSize: number }> => {
  return request.get('/products', { params });
};

// 获取激活的商品列表
export const getActiveProducts = async (params?: {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}): Promise<{ list: Product[]; total: number; page: number; pageSize: number }> => {
  return request.get('/products/active', { params });
};

// 获取新品推荐
export const getNewProducts = async (params?: {
  limit?: number;
}): Promise<Product[]> => {
  return request.get('/products/featured/new', { params });
};

// 获取推荐产品
export const getRecommendedProducts = async (params?: {
  limit?: number;
}): Promise<Product[]> => {
  return request.get('/products/featured/recommended', { params });
};

// 创建商品
export const createProduct = async (data: ProductCreateRequest): Promise<Product> => {
  return request.post('/products', data);
};

// 更新商品
export const updateProduct = async (productId: string, data: ProductUpdateRequest): Promise<Product> => {
  return request.put(`/products/${productId}`, data);
};

// 删除商品
export const deleteProduct = async (productId: string): Promise<void> => {
  return request.delete(`/products/${productId}`);
};

// 获取商品详情
export const getProductDetail = async (productId: string): Promise<Product> => {
  return request.get(`/products/${productId}`);
};

// 上传图片
export const uploadImage = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'image');
  return request.post('/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 更新商品库存
export const updateProductStock = async (productId: string, data: {
  quantity: number;
  type?: 'purchase' | 'sale' | 'adjustment';
  operator?: string;
  remark?: string;
}): Promise<void> => {
  return request.put(`/products/${productId}/stock`, data);
};

// 调整商品库存
export const adjustProductStock = async (productId: string, data: {
  quantity: number;
  type?: 'in' | 'out';
  remark?: string;
}): Promise<void> => {
  return request.post(`/products/${productId}/stock/adjust`, data);
};

// 获取商品库存历史记录
export const getProductStockHistory = async (productId: string, params?: {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}): Promise<StockHistoryResponse> => {
  return request.get(`/products/${productId}/stock/history`, { params });
};