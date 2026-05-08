// 用户相关接口：登录、注册、退出、拉个人信息等
import { getData, postData, putData } from '@/api/request';

export interface LoginPayload {
  username: string;
  password: string;
  loginType: 'customer' | 'admin';
}

export interface UserProfileDto {
  id: number;
  username: string;
  displayName: string;
  userType: 'customer' | 'admin';
  avatar: string;
  level: string;
  phone: string;
  email: string;
  status: string;
  goodReviewCount: number;
  favoriteCount: number;
  memberSince: string;
  city: string;
  roleCodes: string[];
  permissionCodes: string[];
  lastLoginAt?: string;
}

export interface LoginResult {
  token: string;
  refreshToken?: string;
  profile: UserProfileDto;
}

export interface RegisterPayload {
  username: string;
  password: string;
  displayName?: string;
  email?: string;
  avatar?: string;
}

export interface ResetPasswordPayload {
  username: string;
  newPassword: string;
}

export interface UpdateProfilePayload {
  displayName?: string;
  avatar?: string;
  email?: string;
  city?: string;
}

export const loginApi = (payload: LoginPayload): Promise<LoginResult> => {
  return postData<LoginResult>('/auth/login', payload);
};

export const registerApi = (payload: RegisterPayload): Promise<LoginResult> => {
  return postData<LoginResult>('/auth/register', payload);
};

export const resetPasswordApi = (payload: ResetPasswordPayload): Promise<void> => {
  return postData<void>('/auth/reset-password', payload);
};

export const refreshTokenApi = (refreshToken: string): Promise<{ token: string }> => {
  return postData<{ token: string }>('/auth/refresh', { refreshToken });
};

export const logoutApi = (): Promise<void> => {
  return postData<void>('/auth/logout');
};

export const fetchUserProfile = (): Promise<UserProfileDto> => {
  return getData<UserProfileDto>('/user/profile');
};

export const fetchUserCenterApi = (): Promise<UserProfileDto> => {
  return getData<UserProfileDto>('/user/center');
};

export const updateUserProfileApi = (payload: UpdateProfilePayload): Promise<UserProfileDto> => {
  return putData<UserProfileDto>('/user/profile', payload);
};

export const fetchFavoriteProductsApi = () => {
  return getData<import('@/types/product').Product[]>('/user/favorites');
};
