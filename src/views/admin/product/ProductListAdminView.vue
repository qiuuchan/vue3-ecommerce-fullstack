<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchCategoryList } from '@/api/category';
import { deleteProductApi, fetchAdminProductList, updateProductApi } from '@/api/product';
import { useAppI18n } from '@/composables/useAppI18n';
import { formatCurrency } from '@/utils/formatLocale';
import type { Product } from '@/types/product';
import { toastError } from '@/utils/toast';

const { t, locale } = useAppI18n();
const router = useRouter();
const products = ref<Product[]>([]);
/** 封面图加载失败的商品 id，避免裂图一直显示破图标 */
const coverFailedIds = ref<number[]>([]);
const categories = ref<{ id: number; name: string }[]>([]);
const loading = ref(true);
const keyword = ref('');
const filters = reactive({
  categoryId: '',
  status: '',
  minPrice: '',
  maxPrice: ''
});

const loadProducts = async (): Promise<void> => {
  loading.value = true;
  try {
    products.value = await fetchAdminProductList({
      keyword: keyword.value || undefined,
      categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
      status: filters.status ? (filters.status as 'on_sale' | 'off_sale') : undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined
    });
    coverFailedIds.value = [];
  } finally {
    loading.value = false;
  }
};

const loadCategories = async (): Promise<void> => {
  categories.value = await fetchCategoryList();
};

const handleDelete = async (id: number): Promise<void> => {
  const ok = window.confirm(t('admin.product.confirmDelete'));
  if (!ok) return;
  try {
    await deleteProductApi(id);
    await loadProducts();
  } catch (error) {
    toastError(error instanceof Error ? error.message : t('admin.product.deleteFail'));
  }
};

// 快速切换上下架状态
const handleToggleStatus = async (item: Product): Promise<void> => {
  const nextStatus = item.status === 'on_sale' ? 'off_sale' : 'on_sale';
  const actionLabel = nextStatus === 'on_sale' ? t('admin.product.toggleOn') : t('admin.product.toggleOff');
  const ok = window.confirm(t('admin.product.confirmToggle', { name: item.name, action: actionLabel }));
  if (!ok) return;
  try {
    await updateProductApi(item.id, { status: nextStatus });
    await loadProducts();
  } catch (error) {
    toastError(error instanceof Error ? error.message : t('admin.product.opFail'));
  }
};

const onReset = async (): Promise<void> => {
  keyword.value = '';
  filters.categoryId = '';
  filters.status = '';
  filters.minPrice = '';
  filters.maxPrice = '';
  await loadProducts();
};

// Enter 键触发搜索
const onKeywordKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Enter') void loadProducts();
};

const onCoverError = (id: number): void => {
  if (!coverFailedIds.value.includes(id)) {
    coverFailedIds.value = [...coverFailedIds.value, id];
  }
};

const totalOnSale = computed(() => products.value.filter((item) => item.status === 'on_sale').length);
const totalOffSale = computed(() => products.value.filter((item) => item.status === 'off_sale').length);

onMounted(async () => {
  await Promise.all([loadProducts(), loadCategories()]);
});
</script>

<template>
  <div class="admin-page">
    <!-- 页头 -->
    <section class="admin-toolbar anim-fade-up">
      <div>
        <h2 class="admin-toolbar__title">{{ t('admin.product.title') }}</h2>
        <p class="admin-toolbar__sub">{{ t('admin.product.sub') }}</p>
      </div>
      <div class="admin-actions">
        <span class="admin-chip admin-chip--success">{{ t('admin.product.chipOn', { n: totalOnSale }) }}</span>
        <span class="admin-chip admin-chip--warning">{{ t('admin.product.chipOff', { n: totalOffSale }) }}</span>
        <router-link to="/admin/product/create" class="ui-btn ui-btn--primary">{{ t('admin.product.add') }}</router-link>
      </div>
    </section>

    <!-- 筛选 -->
    <section class="admin-panel anim-fade-up anim-delay-1">
      <div class="admin-filters">
        <input
          v-model="keyword"
          class="admin-input"
          :placeholder="t('admin.product.searchPh')"
          @keydown="onKeywordKeydown"
        />
        <select v-model="filters.categoryId" class="admin-select">
          <option value="">{{ t('admin.product.allCat') }}</option>
          <option v-for="item in categories" :key="item.id" :value="String(item.id)">{{ item.name }}</option>
        </select>
        <select v-model="filters.status" class="admin-select">
          <option value="">{{ t('admin.product.allStatus') }}</option>
          <option value="on_sale">{{ t('admin.product.onSaleChip') }}</option>
          <option value="off_sale">{{ t('admin.product.offChip') }}</option>
        </select>
        <input v-model="filters.minPrice" class="admin-input" type="number" :placeholder="t('admin.product.minPrice')" />
        <input v-model="filters.maxPrice" class="admin-input" type="number" :placeholder="t('admin.product.maxPrice')" />
      </div>
      <div class="admin-actions filters-actions">
        <button type="button" class="ui-btn ui-btn--primary ui-btn--sm" @click="loadProducts">{{ t('admin.btn.query') }}</button>
        <button type="button" class="ui-btn ui-btn--ghost ui-btn--sm" @click="onReset">{{ t('admin.btn.reset') }}</button>
      </div>
    </section>

    <!-- 表格 -->
    <section class="admin-panel anim-fade-up anim-delay-2">
      <div class="panel-head">
        <h3 class="admin-panel__title">{{ t('admin.product.panelTitle') }}</h3>
        <span class="panel-count">{{ t('admin.product.totalCount', { n: products.length }) }}</span>
      </div>

      <div v-if="loading" class="admin-empty">
        <span class="loading-spinner" />{{ t('admin.product.loading') }}
      </div>
      <div v-else-if="products.length === 0" class="admin-empty">
        {{ t('admin.product.empty') }}
      </div>

      <div v-else class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 260px;">{{ t('admin.product.col.goods') }}</th>
              <th>{{ t('admin.product.col.code') }}</th>
              <th>{{ t('admin.product.col.cat') }}</th>
              <th>{{ t('admin.product.col.price') }}</th>
              <th>{{ t('admin.product.col.stock') }}</th>
              <th>{{ t('admin.product.col.sales') }}</th>
              <th>{{ t('admin.product.col.status') }}</th>
              <th style="width: 200px;">{{ t('admin.product.col.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in products" :key="item.id">
              <td>
                <div class="product-cell">
                  <img
                    v-if="item.cover && !coverFailedIds.includes(item.id)"
                    :src="item.cover"
                    :alt="item.name"
                    class="product-cell__img"
                    referrerpolicy="no-referrer"
                    @error="onCoverError(item.id)"
                  />
                  <div
                    v-else
                    class="product-cell__img product-cell__img--placeholder"
                    aria-hidden="true"
                  >📦</div>
                  <div>
                    <p class="product-cell__name">{{ item.name }}</p>
                    <p class="product-cell__desc">{{ item.description || t('admin.product.noDesc') }}</p>
                  </div>
                </div>
              </td>
              <td class="td-mono">{{ item.sku || `SKU-${item.id}` }}</td>
              <td>{{ item.categoryName || '--' }}</td>
              <td>
                <span class="td-price">{{ formatCurrency(item.price, locale) }}</span>
                <span v-if="item.originalPrice && item.originalPrice > item.price" class="td-original">
                  {{ formatCurrency(item.originalPrice, locale) }}
                </span>
              </td>
              <td :class="{ 'td-warn': (item.stock ?? 0) < 30 }">{{ item.stock ?? 0 }}</td>
              <td>{{ item.sales ?? 0 }}</td>
              <td>
                <span
                  class="admin-chip"
                  :class="item.status === 'on_sale' ? 'admin-chip--success' : 'admin-chip--warning'"
                >
                  {{ item.status === 'on_sale' ? t('admin.product.onSaleChip') : t('admin.product.offChip') }}
                </span>
              </td>
              <td>
                <div class="admin-actions row-actions">
                  <button
                    type="button"
                    class="ui-btn ui-btn--ghost ui-btn--sm"
                    @click="router.push(`/admin/product/detail/${item.id}`)"
                  >
                    {{ t('admin.product.viewDetail') }}
                  </button>
                  <button
                    type="button"
                    class="ui-btn ui-btn--ghost ui-btn--sm"
                    @click="router.push(`/admin/product/edit/${item.id}`)"
                  >
                    {{ t('admin.btn.edit') }}
                  </button>
                  <button
                    type="button"
                    class="ui-btn ui-btn--ghost ui-btn--sm"
                    :class="item.status === 'on_sale' ? 'btn-offshelf' : 'btn-onshelf'"
                    @click="handleToggleStatus(item)"
                  >
                    {{ item.status === 'on_sale' ? t('admin.product.toggleOff') : t('admin.product.toggleOn') }}
                  </button>
                  <button
                    type="button"
                    class="ui-btn ui-btn--ghost ui-btn--sm btn-delete"
                    @click="handleDelete(item.id)"
                  >
                    {{ t('admin.btn.delete') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.filters-actions {
  margin-top: 16px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
}

.panel-count {
  font-size: 13px;
  color: var(--admin-text-muted, #6b6b6b);
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--admin-border, #e5e5e5);
  border-top-color: #e8532d;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-cell__img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 14px;
  flex-shrink: 0;
}

.product-cell__img--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--admin-fill, #f5f5f5);
  border: 1px solid var(--admin-border, #e5e5e5);
  font-size: 22px;
  object-fit: none;
}

.product-cell__name {
  font-weight: 600;
  font-size: 13px;
  color: var(--admin-text, #1a1a1a);
}

.product-cell__desc {
  margin-top: 3px;
  font-size: 11px;
  color: var(--admin-text-muted, #6b6b6b);
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.td-mono {
  font-family: monospace;
  font-size: 12px;
  color: var(--admin-text-muted, #6b6b6b);
}

.td-price {
  font-weight: 600;
  color: var(--admin-text, #1a1a1a);
}

.td-original {
  display: block;
  font-size: 11px;
  text-decoration: line-through;
  color: var(--admin-text-subtle, #9a9a9a);
}

.td-warn {
  color: #b45309 !important;
  font-weight: 600;
}

.row-actions {
  flex-wrap: wrap;
  gap: 6px;
}

.btn-onshelf { color: #34d399; border-color: rgba(16, 185, 129, 0.3); }
.btn-onshelf:hover { background: rgba(16, 185, 129, 0.12); }
.btn-offshelf { color: #fbbf24; border-color: rgba(245, 158, 11, 0.3); }
.btn-offshelf:hover { background: rgba(245, 158, 11, 0.12); }
.btn-delete { color: #f87171; border-color: rgba(244, 63, 94, 0.3); }
.btn-delete:hover { background: rgba(244, 63, 94, 0.12); }
</style>
