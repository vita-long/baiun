// 优惠卷类型定义
export const CouponTypeMap = {
  ShippingFree: 'shipping_free',
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
export const CouponStatus = {
  Enabled: 'enabled',
  Disabled: 'disabled',
  Expired: 'expired',
} as const;

export type CouponStatus = typeof CouponStatus[keyof typeof CouponStatus];

// 优惠卷基本信息接口
export interface Coupon {
  id: string;
  name: string;
  type: CouponType;
  status: CouponStatus;
  description?: string;
  value: number;
  minAmount?: number;
  reductionAmount?: number;
  discountRate?: number;
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
  name: string;
  type: CouponType;
  value: number;
  description?: string;
  reductionAmount?: number;
  discountRate?: number;
  fixedAmount?: number;
  totalQuantity: number;
  startTime: string;
  endTime: string;
  status?: CouponStatus;
}

// 更新优惠卷请求接口
export interface CouponUpdateRequest {
  name?: string;
  type?: CouponType;
  description?: string;
  minAmount?: number;
  reductionAmount?: number;
  discountRate?: number;
  fixedAmount?: number;
  totalQuantity?: number;
  startAt?: string;
  endAt?: string;
  isPublic?: boolean;
  status?: CouponStatus;
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
