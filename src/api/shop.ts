// 前台店铺相关接口（公开，可不登录；带 token 时商品可显示收藏状态）
import { getData } from '@/api/request';
import type { Product } from '@/types/product';
import type { ShopPublic } from '@/types/shop';

export const fetchShopList = (): Promise<ShopPublic[]> => {
  return getData<ShopPublic[]>('/shops');
};

export const fetchShopDetail = (id: number): Promise<ShopPublic> => {
  return getData<ShopPublic>(`/shops/${id}`);
};

export const fetchShopProducts = (shopId: number): Promise<Product[]> => {
  return getData<Product[]>(`/shops/${shopId}/products`);
};
