import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Product } from '@/types/product';

export const useCompareStore = defineStore('compare', () => {
  const items = ref<Product[]>([]);
  const MAX_COMPARE = 4;

  const count = computed(() => items.value.length);
  const isFull = computed(() => items.value.length >= MAX_COMPARE);

  const hasItem = (id: number): boolean => items.value.some(p => p.id === id);

  const addItem = (product: Product): boolean => {
    if (items.value.length >= MAX_COMPARE) return false;
    if (hasItem(product.id)) return false;
    items.value.push(product);
    return true;
  };

  const removeItem = (id: number): void => {
    items.value = items.value.filter(p => p.id !== id);
  };

  const toggleItem = (product: Product): boolean => {
    if (hasItem(product.id)) {
      removeItem(product.id);
      return false;
    }
    return addItem(product);
  };

  const clearAll = (): void => {
    items.value = [];
  };

  // 比较用的属性 key 列表
  const compareFields = computed(() => [
    { key: 'price' as const, label: '价格' },
    { key: 'originalPrice' as const, label: '原价' },
    { key: 'categoryName' as const, label: '分类' },
    { key: 'shopName' as const, label: '店铺' },
    { key: 'shopCreditLevel' as const, label: '店铺信用' },
    { key: 'sales' as const, label: '销量' },
    { key: 'stock' as const, label: '库存' },
    { key: 'avgRating' as const, label: '评分' },
    { key: 'ratingCount' as const, label: '评价数' },
    { key: 'favoriteCount' as const, label: '收藏数' },
    { key: 'isPremiumProduct' as const, label: '优质商品' },
  ]);

  return {
    items,
    count,
    isFull,
    hasItem,
    addItem,
    removeItem,
    toggleItem,
    clearAll,
    compareFields,
  };
});
