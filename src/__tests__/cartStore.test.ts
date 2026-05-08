import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from '@/stores/cartStore';

// Mock API 模块，避免真实网络请求
vi.mock('@/api/cart', () => ({
  fetchCartList: vi.fn(),
  addCartItem: vi.fn()
}));

describe('购物车 Store 测试', () => {
  beforeEach(() => {
    // 每个测试前创建新的 Pinia 实例
    setActivePinia(createPinia());
    // 清除所有 mock 的调用
    vi.clearAllMocks();
  });

  it('初始状态应该是空购物车', () => {
    const cartStore = useCartStore();
    expect(cartStore.cartList).toEqual([]);
    expect(cartStore.totalPrice).toBe(0);
  });

  it('clearCart 应该清空购物车', () => {
    const cartStore = useCartStore();
    // 先手动设置一些数据（绕过 API）
    cartStore.cartList = [
      { id: 1, productId: 101, name: '测试商品', price: 99.9, count: 2 }
    ];
    // 清空
    cartStore.clearCart();
    // 验证结果
    expect(cartStore.cartList).toEqual([]);
  });

  it('totalPrice 应该正确计算总价', () => {
    const cartStore = useCartStore();
    // 手动设置购物车数据
    cartStore.cartList = [
      { id: 1, productId: 101, name: '商品1', price: 100, count: 2 },
      { id: 2, productId: 102, name: '商品2', price: 50, count: 3 }
    ];
    // 计算预期：100*2 + 50*3 = 200 + 150 = 350
    expect(cartStore.totalPrice).toBe(350);
  });
});
