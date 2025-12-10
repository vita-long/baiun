// 订单类型定义
export interface Order {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  userPhone: string;
  address: string;
  totalPrice: number;
  status: '待支付' | '已支付' | '已发货' | '已完成' | '已取消';
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// 订单项类型定义
export interface OrderItem {
  id: string;
  orderItemId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

// 订单列表请求参数
export interface OrderListRequest {
  page: number;
  pageSize: number;
  status?: string;
  orderId?: string;
  userName?: string;
}

// 订单列表响应
export interface OrderListResponse {
  list: Order[];
  total: number;
}

// 更新订单状态请求
export interface UpdateOrderStatusRequest {
  status: '待支付' | '已支付' | '已发货' | '已完成' | '已取消';
}
