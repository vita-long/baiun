import request from './index';
import type { User } from '@/types/user';

// 用户个人信息更新接口
export interface UpdateUserProfileDto {
  username?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

// 用户密码更新接口
export interface UpdatePasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 获取当前用户信息
export const getCurrentUser = () => {
  return request.get<User>('/users/profile/me');
};

// 更新用户个人信息
export const updateUserProfile = (data: UpdateUserProfileDto) => {
  return request.put<User>('/users/profile/me', data);
};

// 更新用户密码
export const updatePassword = (data: UpdatePasswordDto) => {
  return request.put<User>('/users/profile/me', {
    password: data.newPassword
  });
};

// 上传用户头像
export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'image');
  return request.post<{ url: string }>('/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
