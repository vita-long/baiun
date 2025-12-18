// 优惠卷类型定义
export const CouponTypeMap = {
  ShippingFree: 'shipping_free', // 运单减免
  Discount: 'discount',
  FixedAmount: 'fixed_amount',
} as const;

export type CouponType = typeof CouponTypeMap[keyof typeof CouponTypeMap];

export const CouponTypeToName = {
  [CouponTypeMap.ShippingFree]: '运费免单券',
  [CouponTypeMap.Discount]: '折扣券',
  [CouponTypeMap.FixedAmount]: '固定金额券',
};

// 优惠卷状态定义
export const CouponStatusMap = {
  Active: 'active',      // 激活
  Inactive: 'inactive',  // 未激活
  Expired: 'expired',    // 已过期
  Deleted: 'deleted'     // 已删除
} as const;

export type CouponStatus = typeof CouponStatusMap[keyof typeof CouponStatusMap];

export const CouponStatusToName = {
  [CouponStatusMap.Active]: '启用',
  [CouponStatusMap.Inactive]: '禁用',
  [CouponStatusMap.Expired]: '已过期',
  [CouponStatusMap.Deleted]: '已删除',
};

// 优惠卷基本信息接口
export interface Coupon {
  id: string;
  code: string;
  name: string;
  type: CouponType;
  status: CouponStatus;
  description?: string;
  value: number;
  minAmount?: number;
  reductionAmount?: number;
  discount?: number;
  fixedAmount?: number;
  totalQuantity: number;
  usedQuantity: number;
  startTime: string;
  endTime: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// 创建优惠卷请求接口
export interface CouponCreateRequest {
  name?: string;
  type?: CouponType;
  // 面额
  value?: number;
  // 折扣
  discount?: number;
  // 减免额
  reductionAmount?: number;
  // 最小消费额
  minAmount?: number;

  description?: string;
  // 总数量
  totalQuantity?: number;

  startTime?: string;
  endTime?: string;
  status?: CouponStatus;
  source?: string;
}

// 更新优惠卷请求接口
export interface CouponUpdateRequest extends CouponCreateRequest {
  code?: string;
}

// 优惠卷列表响应接口
export interface CouponListResponse {
  list: Coupon[];
  total: number;
  page: number;
  pageSize: number;
}

// 优惠卷列表请求参数接口
export interface CouponListRequest {
  page?: number;
  pageSize?: number;
  name?: string;
  type?: CouponType;
  status?: CouponStatus;
  isPublic?: boolean;
  startDate?: string;
  endDate?: string;
}
