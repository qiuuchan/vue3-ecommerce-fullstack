import { getData, putData } from '@/api/request';

export interface InventoryItem {
  productId: number;
  name: string;
  sku: string;
  stock: number;
  safeStock: number;
  sales: number;
  status: 'normal' | 'warning';
}

export const fetchInventoryList = (): Promise<InventoryItem[]> => {
  return getData<InventoryItem[]>('/admin/inventory');
};

export const fetchInventoryWarnings = (): Promise<InventoryItem[]> => {
  return getData<InventoryItem[]>('/admin/inventory/warnings');
};

export const updateInventoryApi = (productId: number, stock: number): Promise<InventoryItem> => {
  return putData<InventoryItem>(`/admin/inventory/${productId}`, { stock });
};
