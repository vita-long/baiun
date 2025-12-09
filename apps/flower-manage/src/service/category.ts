import type { Category, CategoryCreateRequest, CategoryUpdateRequest } from '@/types/category';
import { request } from './index';

// 获取分类列表
export const getCategories = async (): Promise<Category[]> => {
  return request.get('/categories');
};

// 创建分类
export const createCategory = async (data: CategoryCreateRequest): Promise<Category> => {
  return request.post('/categories', data);
};

// 更新分类
export const updateCategory = async (categoryId: string, data: CategoryUpdateRequest): Promise<Category> => {
  return request.put(`/categories/${categoryId}`, data);
};

// 删除分类
export const deleteCategory = async (categoryId: string): Promise<void> => {
  return request.delete(`/categories/${categoryId}`);
};

// 获取分类详情
export const getCategoryDetail = async (id: string): Promise<Category> => {
  return request.get(`/categories/${id}`);
};