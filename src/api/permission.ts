import { deleteData, getData, postData, putData } from '@/api/request';

export interface AdminUserItem {
  id: number;
  username: string;
  displayName: string;
  phone: string;
  email: string;
  status: 'enabled' | 'disabled';
  roleCodes: string[];
  lastLoginAt: string;
}

export interface AdminRoleItem {
  id: number;
  code: string;
  name: string;
  description: string;
  permissionCodes: string[];
}

export const fetchAdminUserList = (): Promise<AdminUserItem[]> => {
  return getData<AdminUserItem[]>('/admin/users');
};

export const createAdminUserApi = (payload: Partial<AdminUserItem>): Promise<AdminUserItem> => {
  return postData<AdminUserItem>('/admin/users', payload);
};

export const updateAdminUserApi = (id: number, payload: Partial<AdminUserItem>): Promise<AdminUserItem> => {
  return putData<AdminUserItem>(`/admin/users/${id}`, payload);
};

export const deleteAdminUserApi = (id: number): Promise<void> => {
  return deleteData<void>(`/admin/users/${id}`);
};

export const fetchRoleList = (): Promise<AdminRoleItem[]> => {
  return getData<AdminRoleItem[]>('/admin/roles');
};
