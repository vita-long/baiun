import type { Product, ProductCreateRequest, ProductUpdateRequest } from '@/types/product';
import { request } from './index';

// 获取商品列表
export const getProducts = async (params?: {
  page?: number;
  pageSize?: number;
}): Promise<{ list: Product[]; total: number }> => {
  return request.get('/products', { params });
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
export const deleteProduct = async (id: string): Promise<void> => {
  return request.delete(`/products/${id}`);
};

// 获取商品详情
export const getProductDetail = async (id: string): Promise<Product> => {
  return request.get(`/products/${id}`);
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