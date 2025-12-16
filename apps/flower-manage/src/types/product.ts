import type { Category } from "./category";

// 产品类型定义
export const ProductTypeMap = {
  Normal: 'normal',
  Points: 'points',
} as const;

export type ProductType = typeof ProductTypeMap[keyof typeof ProductTypeMap];

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
  isNew?: boolean;
  isRecommend?: boolean;
  description?: string;
  basePrice: number;
  price: number;
  stock: number;
  sales: number;
  productType: ProductType;
  pointsPrice?: number;
  createdAt: string;
  updatedAt: string;
}

// 商品创建/编辑请求
export interface ProductCreateRequest {
  name: string;
  mainImage: string;
  images: string[];
  categoryId: string;
  basePrice: number;
  price: number;
  isActive: boolean;
  isNew?: boolean;
  isRecommend?: boolean;
  productType: ProductType;
  pointsPrice?: number;
  description?: string;
}

export interface ProductUpdateRequest {
  name: string;
  mainImage: string;
  images: string[];
  categoryId: string;
  basePrice: number;
  price: number;
  isActive: boolean;
  isNew?: boolean;
  isRecommend?: boolean;
  productType: ProductType;
  pointsPrice?: number;
  description?: string;
}

// 商品列表响应
export interface ProductListResponse {
  list: Product[];
  total: number;
  page: number;
  pageSize: number;
}

// 积分商品列表请求
export interface PointsProductListRequest {
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}