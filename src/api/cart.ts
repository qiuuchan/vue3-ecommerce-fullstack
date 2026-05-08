// 购物车接口文件：专门放“跟购物车有关的请求函数”
import { deleteData, getData, postData, putData } from '@/api/request';

// 购物车每一项在后端返回时的形状（字段名以后可以和后端对齐）
export interface CartItemDto {
  id: number;
  productId: number;
  name: string;
  price: number;
  count: number;
}

export interface AddCartPayload {
  productId: number;
  count: number;
}

// 拉取购物车列表：一般对应 GET /cart
export const fetchCartList = (): Promise<CartItemDto[]> => {
  return getData<CartItemDto[]>('/cart');
};

// 往购物车加一件商品：一般对应 POST /cart/items
export const addCartItem = (payload: AddCartPayload): Promise<void> => {
  return postData<void>('/cart/items', payload);
};

// 修改某条购物车记录的数量：一般对应 PUT /cart/items/:id
export const updateCartItemCount = (itemId: number, count: number): Promise<void> => {
  return putData<void>(`/cart/items/${itemId}`, { count });
};

// 删除某条购物车记录：一般对应 DELETE /cart/items/:id
export const removeCartItem = (itemId: number): Promise<void> => {
  return deleteData<void>(`/cart/items/${itemId}`);
};
