<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { WarningFilled, Box, Search } from '@element-plus/icons-vue';
import { fetchProductList } from '@/api/product';
import GoodsCard from '@/components/GoodsCard.vue';
import type { Product } from '@/types/product';
import { useAppI18n } from '@/composables/useAppI18n';
import { translateCategoryName } from '@/utils/categoryI18n';

const { t, locale } = useAppI18n();

const products = ref<Product[]>([]);
const loading = ref(true);
const loadError = ref('');
/** 搜索关键字：匹配商品名或店铺名 */
const keyword = ref('');
/** 选中的分类 id，空字符串表示不限 */
const categoryId = ref<number | ''>('');
/** 排序方式 */
const sortBy = ref<'default' | 'sales_desc' | 'price_asc' | 'price_desc'>('default');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(12);
const pageSizeOptions = [12, 24, 36];

// 当筛选条件变化时重置到第一页
watch([keyword, categoryId, sortBy], () => {
  currentPage.value = 1;
});

// 从已加载商品里推导分类 Tab（无需额外接口）
const categoryOptions = computed(() => {
  const map = new Map<number, string>();
  products.value.forEach((p) => {
    if (p.categoryId != null && p.categoryName) {
      map.set(p.categoryId, translateCategoryName(p.categoryName, locale.value));
    }
  });
  return [...map.entries()].map(([id, name]) => ({ id, name }));
});

// 过滤 + 排序后的列表
const filteredProducts = computed(() => {
  let list = [...products.value];
  const k = keyword.value.trim().toLowerCase();
  if (k) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(k) || (p.shopName || '').toLowerCase().includes(k)
    );
  }
  if (categoryId.value !== '') {
    list = list.filter((p) => p.categoryId === categoryId.value);
  }
  if (sortBy.value === 'sales_desc') {
    list.sort((a, b) => (b.sales || 0) - (a.sales || 0));
  } else if (sortBy.value === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy.value === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  }
  return list;
});

// 分页后的列表
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredProducts.value.slice(start, end);
});

// 总页数
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / pageSize.value));

// 分页显示范围
const pageRange = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 2;
  const range: (number | string)[] = [];
  
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }
  
  if (current - delta > 2) {
    range.unshift('...');
  }
  if (total > 1) {
    range.unshift(1);
  }
  if (current + delta < total - 1) {
    range.push('...');
  }
  if (total > 1 && !range.includes(total)) {
    range.push(total);
  }
  
  return range;
});

// 分页操作
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
};

const loadProducts = async (): Promise<void> => {
  loading.value = true;
  loadError.value = '';
  try {
    products.value = await fetchProductList();
  } catch (error) {
    const msg = error instanceof Error ? error.message : t('productList.loadFail');
    console.error(msg);
    loadError.value = msg;
    products.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => { void loadProducts(); });
</script>

<template>
  <div class="product-page">
    <!-- 页头 -->
    <div class="product-page__header">
      <div>
        <h1 class="product-page__title">
          {{ t('productList.title') }}
        </h1>
        <p class="product-page__sub">
          {{ t('productList.sub') }}
        </p>
      </div>
      <div class="product-page__badge">
        {{ t('productList.showing') }} <b>{{ filteredProducts.length }}</b> {{ t('productList.of') }} {{ products.length }} {{ t('productList.unit') }}
      </div>
    </div>

    <!-- 工具条：搜索、分类、排序（提升列表可用性） -->
    <div v-if="!loading && !loadError && products.length" class="product-toolbar">
      <input
        v-model="keyword"
        type="search"
        class="product-toolbar__search"
        :placeholder="t('productList.searchPh')"
      >
      <div class="product-toolbar__chips">
        <button
          type="button"
          class="chip"
          :class="{ 'chip--on': categoryId === '' }"
          @click="categoryId = ''"
        >
          {{ t('productList.allCats') }}
        </button>
        <button
          v-for="c in categoryOptions"
          :key="c.id"
          type="button"
          class="chip"
          :class="{ 'chip--on': categoryId === c.id }"
          @click="categoryId = c.id"
        >
          {{ c.name }}
        </button>
      </div>
      <select v-model="sortBy" class="product-toolbar__sort">
        <option value="default">{{ t('productList.sortDefault') }}</option>
        <option value="sales_desc">{{ t('productList.sortSales') }}</option>
        <option value="price_asc">{{ t('productList.sortPriceAsc') }}</option>
        <option value="price_desc">{{ t('productList.sortPriceDesc') }}</option>
      </select>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="product-skeleton">
      <div
        v-for="i in 6"
        :key="i"
        class="skeleton-card"
      />
    </div>

    <!-- 错误 -->
    <div v-else-if="loadError" class="ui-empty">
      <span class="ui-empty__icon" aria-hidden="true"><el-icon :size="36"><WarningFilled /></el-icon></span>
      <p>{{ loadError }}</p>
      <p style="font-size:.8rem;margin-top:8px;opacity:.6">{{ t('productList.errHint') }}</p>
      <button
        type="button"
        class="ui-btn ui-btn--ghost"
        style="margin-top:16px"
        @click="loadProducts"
      >
        {{ t('productList.retry') }}
      </button>
    </div>

    <!-- 空 -->
    <div v-else-if="products.length === 0" class="ui-empty">
      <span class="ui-empty__icon" aria-hidden="true"><el-icon :size="36"><Box /></el-icon></span>
      {{ t('productList.empty') }}
    </div>

    <!-- 网格 -->
    <div v-else-if="filteredProducts.length === 0" class="ui-empty">
      <span class="ui-empty__icon" aria-hidden="true"><el-icon :size="36"><Search /></el-icon></span>
      {{ t('productList.noMatch') }}
    </div>

    <div v-else>
      <div class="goods-grid">
        <GoodsCard
          v-for="item in paginatedProducts"
          :id="item.id"
          :key="item.id"
          :shop-id="item.shopId"
          :name="item.name"
          :price="item.price"
          :cover="item.cover"
          :shop-name="item.shopName"
          :favorite-count="item.favoriteCount"
          :good-review-count="item.goodReviewCount"
          :avg-rating="item.avgRating"
          :is-premium-product="item.isPremiumProduct"
          :my-rating="item.myRating"
          :can-rate="item.canRate"
          :shop-good-review-count="item.shopGoodReviewCount"
          :shop-credit-level="item.shopCreditLevel"
          :is-favorite="item.isFavorite"
        />
      </div>

      <!-- 分页组件 -->
      <div v-if="totalPages > 1" class="pagination">
        <div class="pagination__info">
          <span>{{ t('pagination.total', { n: filteredProducts.length }) }}</span>
          <select
            :value="pageSize"
            class="pagination__size"
            @change="handlePageSizeChange(Number(($event.target as HTMLSelectElement).value))"
          >
            <option v-for="size in pageSizeOptions" :key="size" :value="size">
              {{ size }} {{ t('pagination.perPage') }}
            </option>
          </select>
        </div>

        <div class="pagination__nav">
          <button
            type="button"
            class="pagination__btn"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            ← {{ t('pagination.prev') }}
          </button>

          <template v-for="(page, idx) in pageRange" :key="idx">
            <button
              v-if="typeof page === 'number'"
              type="button"
              class="pagination__btn"
              :class="{ 'pagination__btn--active': currentPage === page }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span v-else class="pagination__ellipsis">{{ page }}</span>
          </template>

          <button
            type="button"
            class="pagination__btn"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            {{ t('pagination.next') }} →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-page__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 32px;
}

.product-page__title {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--f-text, #1a1a1a);
  margin-bottom: 8px;
}

.product-page__sub {
  font-size: .875rem;
  color: var(--f-text-muted, #6b6b6b);
  line-height: 1.55;
}

.product-page__badge {
  padding: 8px 14px;
  background: #fafafa;
  border: 1px solid var(--f-border, #e5e5e5);
  border-radius: 4px;
  font-size: .8125rem;
  color: var(--f-text-muted, #6b6b6b);
  white-space: nowrap;
}

.product-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  padding: 16px 18px;
  background: var(--f-surface, #fff);
  border-radius: var(--f-radius, 6px);
  border: 1px solid var(--f-border, #e5e5e5);
  box-shadow: none;
}

.product-toolbar__search {
  flex: 1;
  min-width: 200px;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid var(--f-border, #e5e5e5);
  font-size: .875rem;
  background: #fafafa;
}

.product-toolbar__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 2;
  min-width: 200px;
}

.chip {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--f-border, #e5e5e5);
  background: #fff;
  font-size: .78rem;
  font-weight: 600;
  color: var(--f-text-muted, #64748b);
  cursor: pointer;
  transition: background .2s, border-color .2s, color .2s;
}

.chip--on {
  border-color: var(--f-brand, #e8532d);
  background: rgba(61, 90, 128, 0.06);
  color: var(--f-brand, #e8532d);
}

.product-toolbar__sort {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid var(--f-border, #e5e5e5);
  font-size: .8rem;
  background: #fff;
  color: var(--f-text, #1a1a1a);
}

/* 骨架屏 */
.product-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.skeleton-card {
  aspect-ratio: .8;
  border-radius: var(--f-radius, 6px);
  border: 1px solid var(--f-border, #e5e5e5);
  background: linear-gradient(
    90deg,
    #edeae6 25%,
    #f5f2ee 50%,
    #edeae6 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

/* 分页组件 */
.pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid var(--f-border, #e5e5e5);
  border-radius: 8px;
}

.pagination__info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.875rem;
  color: var(--f-text-muted, #6b6b6b);
}

.pagination__size {
  padding: 6px 10px;
  border: 1px solid var(--f-border, #e5e5e5);
  border-radius: 4px;
  font-size: 0.8125rem;
  background: #fff;
  color: var(--f-text, #1a1a1a);
  cursor: pointer;
}

.pagination__nav {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.pagination__btn {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--f-text-muted, #6b6b6b);
  background: #fff;
  border: 1px solid var(--f-border, #e5e5e5);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination__btn:hover:not(:disabled) {
  border-color: var(--f-brand, #e8532d);
  color: var(--f-brand, #e8532d);
}

.pagination__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination__btn--active {
  background: var(--f-brand, #e8532d);
  border-color: var(--f-brand, #e8532d);
  color: #fff;
}

.pagination__ellipsis {
  padding: 0 4px;
  color: var(--f-text-subtle, #9a9a9a);
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination__nav {
    justify-content: center;
  }
}
</style>
