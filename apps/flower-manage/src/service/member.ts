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
  growthValue: number;
  points: number;
  expireTime?: string;
  freeShippingTicketsBalance: number;
  freeBouquetUpgradesBalance: number;
  subscriptionStatus: 'active' | 'inactive' | 'expired';
  createdAt: string;
  updatedAt: string;
}

// 积分和成长值调整接口
export interface AdjustPointsDto {
  userId: string;
  points: number;
  reason: string;
}

export interface AdjustGrowthValueDto {
  userId: string;
  growthValue: number;
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

export interface GrowthValueHistory {
  id: number;
  userId: string;
  growthValue: number;
  totalGrowthValue: number;
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
  items: T[];
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

// 成长值管理API
export const adjustGrowthValue = (data: AdjustGrowthValueDto) => {
  return request.post<MemberInfo>('/member/growth-value/adjust', data);
};

export const getGrowthValueHistory = (userId: string, page: number = 1, limit: number = 10) => {
  return request.get<PaginationResponse<GrowthValueHistory>>('/member/growth-value/history', {
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

// 会员列表API - 模拟接口，实际项目中需要后端提供
export interface MemberListItem {
  userId: string;
  username: string;
  email: string;
  phone: string;
  currentLevel: string;
  points: number;
  growthValue: number;
  joinDate: string;
  status: 'active' | 'inactive';
}

export const getMembers = (page: number = 1, limit: number = 10) => {
  // 模拟数据，实际项目中应该调用后端API
  // return request.get<PaginationResponse<MemberListItem>>('/member/list', {
  //   params: { page, limit }
  // });
  
  // 模拟数据
  const mockMembers: MemberListItem[] = [
    {
      userId: 'user123',
      username: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      currentLevel: '玫瑰会员',
      points: 1200,
      growthValue: 3500,
      joinDate: '2023-05-10',
      status: 'active'
    },
    {
      userId: 'user124',
      username: '李四',
      email: 'lisi@example.com',
      phone: '13900139000',
      currentLevel: '百合会员',
      points: 850,
      growthValue: 2200,
      joinDate: '2023-08-15',
      status: 'active'
    },
    {
      userId: 'user125',
      username: '王五',
      email: 'wangwu@example.com',
      phone: '13700137000',
      currentLevel: '种子会员',
      points: 320,
      growthValue: 950,
      joinDate: '2024-01-20',
      status: 'active'
    }
  ];
  
  return Promise.resolve({
    items: mockMembers,
    total: mockMembers.length,
    page,
    limit
  });
};