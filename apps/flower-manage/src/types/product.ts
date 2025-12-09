import type { Category } from "./category";

// 商品类型定义
export interface Product {
  id: string;
  name: string;
  productId: string;
  mainImage: string;
  images: string[];
  categoryId: string;
  categoryName?: string;
  category?: Category;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 商品创建/编辑请求
export interface ProductCreateRequest {
  name: string;
  mainImage: string;
  images: string[];
  categoryId: string;
  isActive: boolean;
  description?: string;
}

export interface ProductUpdateRequest {
  name: string;
  mainImage: string;
  images: string[];
  categoryId: string;
  isActive: boolean;
  description?: string;
}