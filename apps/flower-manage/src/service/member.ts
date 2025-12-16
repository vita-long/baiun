import type { User } from '@/types/user';
import request from './index';

// 会员等级相关接口
export interface MemberLevel {
  id: number;
  name: string;
  code: string;
  subscriptionPrice: number;
  validityPeriod: number;
  discountRate: number;
  freeShippingTickets: number;
  unlimitedFreeShipping: boolean;
  freeBouquetUpgrades: number;
  holidayGifts: boolean;
  subscriptionDiscount: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberLevelDto {
  name: string;
  code: string;
  subscriptionPrice: number;
  validityPeriod: number;
  discountRate: number;
  freeShippingTickets: number;
  unlimitedFreeShipping: boolean;
  freeBouquetUpgrades: number;
  holidayGifts: boolean;
  subscriptionDiscount: number;
  description?: string;
  isActive: boolean;
}

export interface UpdateMemberLevelDto {
  name?: string;
  code?: string;
  subscriptionPrice?: number;
  validityPeriod?: number;
  discountRate?: number;
  freeShippingTickets?: number;
  unlimitedFreeShipping?: boolean;
  freeBouquetUpgrades?: number;
  holidayGifts?: boolean;
  subscriptionDiscount?: number;
  description?: string;
  isActive?: boolean;
}

// 会员信息相关接口
export interface MemberInfo {
  id: number;
  userId: string;
  currentLevelId: number;
  currentLevel: MemberLevel;
  user: User;
  points: number;
  expireTime?: string;
  freeShippingTicketsBalance: number;
  freeBouquetUpgradesBalance: number;
  subscriptionStatus: 'active' | 'inactive' | 'expired';
  createdAt: string;
  updatedAt: string;
}

// 积分调整接口
export interface AdjustPointsDto {
  userId: string;
  amount: number;
  type: 'increase' | 'decrease';
  reason: string;
}

// 历史记录接口
export interface PointsHistory {
  id: number;
  userId: string;
  points: number;
  totalPoints: number;
  reason: string;
  createdAt: string;
}

// 订阅相关接口
export interface MemberSubscription {
  id: number;
  userId: string;
  memberLevelId: number;
  memberLevel: MemberLevel;
  subscriptionDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// 分页响应接口
export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
}

// 会员等级管理API
export const getMemberLevels = () => {
  return request.get<MemberLevel[]>('/member/levels');
};

export const getMemberLevelById = (id: number) => {
  return request.get<MemberLevel>(`/member/levels/${id}`);
};

export const createMemberLevel = (data: CreateMemberLevelDto) => {
  return request.post<MemberLevel>('/member/levels', data);
};

export const updateMemberLevel = (id: number, data: UpdateMemberLevelDto) => {
  return request.patch<MemberLevel>(`/member/levels/${id}`, data);
};

export const deleteMemberLevel = (id: number) => {
  return request.delete(`/member/levels/${id}`);
};

// 会员信息管理API
export const getMemberInfo = (userId: string) => {
  return request.get<MemberInfo>(`/member/info/${userId}`);
};

export const getCurrentMemberInfo = () => {
  return request.get<MemberInfo>('/member/info');
};

// 积分管理API
export const adjustPoints = (data: AdjustPointsDto) => {
  return request.post<MemberInfo>('/member/points/adjust', data);
};

export const getPointsHistory = (userId: string, page: number = 1, limit: number = 10) => {
  return request.get<PaginationResponse<PointsHistory>>('/member/points/history', {
    params: { userId, page, limit }
  });
};



// 会员订阅API
export const subscribeMember = (levelId: number) => {
  return request.post<MemberSubscription>(`/member/subscribe/${levelId}`);
};

export const getMemberSubscriptions = (userId: string, page: number = 1, limit: number = 10) => {
  return request.get<PaginationResponse<MemberSubscription>>('/member/subscriptions', {
    params: { userId, page, limit }
  });
};

export const getMembers = (page: number = 1, limit: number = 10) => {
  return request.get<PaginationResponse<MemberInfo>>('/member/list', {
    params: { page, limit }
  });
};

// 会员状态更新接口
export type UpdateMemberStatusType = 'active' | 'inactive' | 'expired';

// 更新会员状态API
export const updateMemberStatus = (userId: string, active: UpdateMemberStatusType) => {
  return request.post<MemberInfo>('/member/status/activate', { userId, active });
};