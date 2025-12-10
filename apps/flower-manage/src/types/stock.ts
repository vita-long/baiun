// 库存调整类型
export type StockAdjustmentType = 'purchase' | 'sale' | 'adjustment';

// 库存调整请求参数
export interface AdjustStockRequest {
  changeQuantity: number;
  type: StockAdjustmentType;
  operator?: string;
  remark?: string;
}

// 库存历史记录
export interface StockHistory {
  id: number;
  productId: string;
  productName: string;
  beforeStock: number;
  afterStock: number;
  changeQuantity: number;
  type: StockAdjustmentType;
  operator?: string;
  remark?: string;
  createdAt: string;
}

// 低库存产品
export interface LowStockProduct {
  id: number;
  productId: string;
  name: string;
  currentStock: number;
  threshold?: number;
}

// 库存历史记录响应
export interface StockHistoryResponse {
  list: StockHistory[];
  total: number;
  page: number;
  pageSize: number;
}

// 低库存产品响应
export interface LowStockProductsResponse {
  list: LowStockProduct[];
  total: number;
  page: number;
  pageSize: number;
}
