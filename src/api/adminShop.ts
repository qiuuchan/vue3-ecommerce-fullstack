// 后台店铺管理接口
import { deleteData, getData, postData, putData } from '@/api/request';
import type { ShopAdminRecord } from '@/types/shop';

export const fetchAdminShopList = (): Promise<ShopAdminRecord[]> => {
  return getData<ShopAdminRecord[]>('/admin/shops');
};

export const createAdminShopApi = (payload: Partial<ShopAdminRecord>): Promise<ShopAdminRecord> => {
  return postData<ShopAdminRecord>('/admin/shops', payload);
};

export const updateAdminShopApi = (
  id: number,
  payload: Partial<ShopAdminRecord>
): Promise<ShopAdminRecord> => {
  return putData<ShopAdminRecord>(`/admin/shops/${id}`, payload);
};

export const deleteAdminShopApi = (id: number): Promise<void> => {
  return deleteData<void>(`/admin/shops/${id}`);
};
