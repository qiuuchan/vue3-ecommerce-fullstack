import { deleteData, getData, postData, putData } from '@/api/request';

export interface CategoryItem {
  id: number;
  name: string;
  nameEn?: string;
  parentId: number | null;
  sort: number;
  enabled: boolean;
  productCount: number;
}

export const fetchCategoryList = (): Promise<CategoryItem[]> => {
  return getData<CategoryItem[]>('/admin/categories');
};

export const createCategoryApi = (payload: Partial<CategoryItem>): Promise<CategoryItem> => {
  return postData<CategoryItem>('/admin/categories', payload);
};

export const updateCategoryApi = (id: number, payload: Partial<CategoryItem>): Promise<CategoryItem> => {
  return putData<CategoryItem>(`/admin/categories/${id}`, payload);
};

export const deleteCategoryApi = (id: number): Promise<void> => {
  return deleteData<void>(`/admin/categories/${id}`);
};
