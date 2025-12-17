import request from './index';
import type { Coupon, CouponCreateRequest, CouponUpdateRequest, CouponListRequest, CouponListResponse } from '@/types/coupon';

/**
 * 获取优惠卷列表
 */
export const getCoupons = async (params?: CouponListRequest): Promise<CouponListResponse> => {
  return request.get('/coupons', { params });
};

/**
 * 获取单个优惠卷详情
 */
export const getCouponById = async (id: string): Promise<Coupon> => {
  return request.get(`/coupons/${id}`);
};

/**
 * 创建优惠卷
 */
export const createCoupon = async (data: CouponCreateRequest): Promise<Coupon> => {
  return request.post('/coupons', data);
};

/**
 * 更新优惠卷
 */
export const updateCoupon = async (id: string, data: CouponUpdateRequest): Promise<Coupon> => {
  return request.put(`/coupons/${id}`, data);
};

/**
 * 删除优惠卷
 */
export const deleteCoupon = async (id: string): Promise<void> => {
  return request.delete(`/coupons/${id}`);
};

/**
 * 启用/禁用优惠卷
 */
export const updateCouponStatus = async (id: string, status: 'enabled' | 'disabled'): Promise<Coupon> => {
  return request.patch(`/coupons/${id}/status`, { status });
};
