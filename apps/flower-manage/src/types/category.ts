// 分类类型定义
export interface Category {
  id: string;
  categoryId: string;
  categoryName: string;
  description?: string;
  productCount: number; // 关联商品数量
  createdAt: string;
  updatedAt: string;
}

// 分类创建/编辑请求
export interface CategoryCreateRequest {
  categoryName: string;
  description?: string;
}

export interface CategoryUpdateRequest {
  categoryName: string;
  description?: string;
}