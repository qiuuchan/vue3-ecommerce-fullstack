import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { fetchProductList } from '@/api/product';
import type { Product } from '@/types/product';

export const useHomeStore = defineStore('home', () => {
  const products = ref<Product[]>([]);
  const loading = ref(true);
  const error = ref('');

  const onSaleProducts = computed(() => products.value.filter((p) => p.status === 'on_sale'));

  const flashSaleItems = computed(() => {
    const list = onSaleProducts.value;
    const discounted = list.filter((p) => (p.originalPrice ?? 0) > p.price);
    const rest = list.filter((p) => !discounted.some((d) => d.id === p.id));
    return [...discounted, ...rest].slice(0, 6);
  });

  const hotProducts = computed(() =>
    [...onSaleProducts.value].sort((a, b) => (b.sales ?? 0) - (a.sales ?? 0)).slice(0, 8)
  );

  const heroMosaicProducts = computed(() => onSaleProducts.value.slice(0, 3));

  const loadProducts = async (): Promise<void> => {
    loading.value = true;
    error.value = '';
    try {
      products.value = await fetchProductList();
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载失败';
      console.error('首页商品加载失败', e);
    } finally {
      loading.value = false;
    }
  };

  return {
    products,
    loading,
    error,
    onSaleProducts,
    flashSaleItems,
    hotProducts,
    heroMosaicProducts,
    loadProducts
  };
});
