import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCartStore, type CartLine } from './cartStore';

// Mock API
vi.mock('@/api/cart', () => ({
  fetchCartList: vi.fn(),
  addCartItem: vi.fn(),
}));

// Mock toast
vi.mock('@/utils/toast', () => ({
  toastError: vi.fn(),
}));

import { fetchCartList, addCartItem } from '@/api/cart';

describe('cartStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('初始购物车为空，总价为 0', () => {
    const store = useCartStore();
    expect(store.cartList).toEqual([]);
    expect(store.totalPrice).toBe(0);
  });

  it('loadCart 成功后填充购物车数据', async () => {
    const mockData: CartLine[] = [
      { id: 1, productId: 1, name: '沃柑', price: 15.8, count: 2 },
      { id: 2, productId: 2, name: '猕猴桃', price: 28, count: 1 },
    ];
    vi.mocked(fetchCartList).mockResolvedValue(mockData);

    const store = useCartStore();
    await store.loadCart();

    expect(store.cartList).toEqual(mockData);
    expect(store.totalPrice).toBe(15.8 * 2 + 28);
  });

  it('loadCart 失败时清空购物车', async () => {
    vi.mocked(fetchCartList).mockRejectedValue(new Error('网络错误'));

    const store = useCartStore();
    store.cartList.value = [{ id: 1, productId: 1, name: 'x', price: 10, count: 1 }];
    await store.loadCart();

    expect(store.cartList).toEqual([]);
  });

  it('addGoods 成功后刷新购物车', async () => {
    const freshList: CartLine[] = [{ id: 1, productId: 3, name: '新商品', price: 20, count: 1 }];
    vi.mocked(addCartItem).mockResolvedValue(undefined as any);
    vi.mocked(fetchCartList).mockResolvedValue(freshList);

    const store = useCartStore();
    const ok = await store.addGoods({ id: 3, name: '新商品', price: 20 });

    expect(ok).toBe(true);
    expect(addCartItem).toHaveBeenCalledWith({ productId: 3, count: 1 });
    expect(store.cartList).toEqual(freshList);
  });

  it('addGoods 失败返回 false', async () => {
    vi.mocked(addCartItem).mockRejectedValue(new Error('401'));

    const store = useCartStore();
    const ok = await store.addGoods({ id: 1, name: 'x', price: 1 });

    expect(ok).toBe(false);
  });

  it('clearCart 清空购物车', () => {
    const store = useCartStore();
    store.cartList.value = [{ id: 1, productId: 1, name: 'x', price: 10, count: 1 }];
    store.clearCart();
    expect(store.cartList).toEqual([]);
  });
});
