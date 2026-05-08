// 商品接口文件：专门放“跟商品有关的请求函数”
import { deleteData, getData, postData, putData } from '@/api/request';
import type { Product, ProductReview } from '@/types/product';

// 获取商品列表：对应后端一般是 GET /products
export const fetchProductList = (): Promise<Product[]> => {
  return getData<Product[]>('/products');
};

// 获取单个商品：对应后端一般是 GET /products/:id
export const fetchProductDetail = (id: number): Promise<Product> => {
  return getData<Product>(`/products/${id}`);
};

// 收藏商品：当前登录用户点击收藏时调用。
export const favoriteProductApi = (id: number): Promise<Product> => {
  return postData<Product>(`/products/${id}/favorite`);
};

// 取消收藏：再次点击收藏按钮时调用。
export const unfavoriteProductApi = (id: number): Promise<Product> => {
  return deleteData<Product>(`/products/${id}/favorite`);
};

// 提交或修改星级评价：1～5 星，同一用户覆盖更新
export const submitProductRatingApi = (id: number, stars: number): Promise<Product> => {
  return postData<Product>(`/products/${id}/reviews`, { stars });
};

// 获取商品评价列表
export const fetchProductReviewsApi = (id: number): Promise<ProductReview[]> => {
  return getData<ProductReview[]>(`/products/${id}/reviews`);
};

export interface AdminProductQuery {
  keyword?: string;
  categoryId?: number;
  status?: 'on_sale' | 'off_sale';
  minPrice?: number;
  maxPrice?: number;
}

// 后台商品列表：支持按关键字、分类、状态、价格区间筛选。
export const fetchAdminProductList = (params?: AdminProductQuery): Promise<Product[]> => {
  return getData<Product[]>('/admin/products', params);
};

// 后台商品详情：和前台详情拆开，方便以后返回更完整字段。
export const fetchAdminProductDetail = (id: number): Promise<Product> => {
  return getData<Product>(`/admin/products/${id}`);
};

// 后台新增商品。
export const createProductApi = (payload: Partial<Product>): Promise<Product> => {
  return postData<Product>('/admin/products', payload);
};

// 后台更新商品。
export const updateProductApi = (id: number, payload: Partial<Product>): Promise<Product> => {
  return putData<Product>(`/admin/products/${id}`, payload);
};

// 后台删除商品。
export const deleteProductApi = (id: number): Promise<void> => {
  return deleteData<void>(`/admin/products/${id}`);
};
