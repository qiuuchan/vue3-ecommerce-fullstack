import { getData, putData } from '@/api/request';
import type { UserProfileDto } from './user';

export interface ProfileUpdatePayload {
  displayName: string;
  phone: string;
  email: string;
}

export const fetchProfileApi = (): Promise<UserProfileDto & { phone: string; email: string }> => {
  return getData<UserProfileDto & { phone: string; email: string }>('/admin/profile');
};

export const updateProfileApi = (
  payload: ProfileUpdatePayload
): Promise<UserProfileDto & { phone: string; email: string }> => {
  return putData<UserProfileDto & { phone: string; email: string }>('/admin/profile', payload);
};
