<script setup lang="ts">
import { useCompareStore } from '@/stores/compareStore';
import { useAppI18n } from '@/composables/useAppI18n';
import { formatCurrency } from '@/utils/formatLocale';
import { translateCreditLevel } from '@/utils/creditI18n';
import { useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';
import type { AppLocale } from '@/i18n/messages';
import { computed } from 'vue';

const { t, locale } = useAppI18n();
const router = useRouter();
const compareStore = useCompareStore();

const fieldLabel = (key: string): string => {
  const map: Record<string, string> = {
    price: t('compare.price'),
    originalPrice: t('compare.originalPrice'),
    categoryName: t('compare.category'),
    shopName: t('compare.shop'),
    shopCreditLevel: t('compare.shopCredit'),
    sales: t('compare.sales'),
    stock: t('compare.stock'),
    avgRating: t('compare.rating'),
    ratingCount: t('compare.reviewCount'),
    favoriteCount: t('compare.favCount'),
    isPremiumProduct: t('compare.isPremium'),
  };
  return map[key] || key;
};

const formatFieldValue = (key: string, value: any): string => {
  if (value == null) return '-';
  if (key === 'price' || key === 'originalPrice') return formatCurrency(value, locale.value as AppLocale);
  if (key === 'shopCreditLevel') return translateCreditLevel(value, locale.value as AppLocale);
  if (key === 'avgRating') return Number(value).toFixed(1);
  if (key === 'isPremiumProduct') return value ? t('common.yes') : t('common.no');
  return String(value);
};

const isEmpty = computed(() => compareStore.items.length === 0);
</script>

<template>
  <div class="compare-page">
    <div class="compare-header">
      <button type="button" class="compare-back" @click="router.back()">
        <el-icon :size="18"><ArrowLeft /></el-icon>
      </button>
      <h1 class="compare-title">{{ t('compare.title') }}</h1>
      <button
        v-if="!isEmpty"
        type="button"
        class="compare-clear"
        @click="compareStore.clearAll()"
      >
        {{ t('compare.clearAll') }}
      </button>
    </div>

    <!-- 空状态 -->
    <div v-if="isEmpty" class="compare-empty">
      <p>{{ t('compare.empty') }}</p>
      <router-link to="/products" class="compare-empty__link">
        {{ t('compare.goShopping') }}
      </router-link>
    </div>

    <!-- 比较表格 -->
    <div v-else class="compare-table-wrap">
      <table class="compare-table">
        <thead>
          <tr>
            <th class="compare-table__label-col">{{ t('compare.field') }}</th>
            <th
              v-for="item in compareStore.items"
              :key="item.id"
              class="compare-table__product-col"
            >
              <div class="compare-product-card">
                <img :src="item.cover" :alt="item.name" class="compare-product-card__img">
                <router-link :to="`/products/${item.id}`" class="compare-product-card__name">
                  {{ item.name }}
                </router-link>
                <span class="compare-product-card__price">
                  {{ formatCurrency(item.price, locale) }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="field in compareStore.compareFields" :key="field.key">
            <td class="compare-table__label-col">{{ fieldLabel(field.key) }}</td>
            <td
              v-for="item in compareStore.items"
              :key="item.id"
              class="compare-table__value-col"
              :class="{ 'compare-table__value-col--highlight': field.key === 'price' }"
            >
              {{ formatFieldValue(field.key, item[field.key]) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.compare-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 20px 100px;
}

.compare-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.compare-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  color: #1a1a1a;
}

.compare-back:hover {
  background: #f5f5f5;
}

.compare-title {
  flex: 1;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.compare-clear {
  border: none;
  background: transparent;
  color: #e8532d;
  font-size: 0.875rem;
  cursor: pointer;
}

.compare-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 0;
  color: #9a9a9a;
}

.compare-empty__link {
  color: var(--f-brand, #e8532d);
  font-weight: 600;
}

/* 表格 */
.compare-table-wrap {
  overflow-x: auto;
}

.compare-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.compare-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #fff;
}

.compare-table__label-col {
  width: 120px;
  padding: 12px 16px;
  text-align: right;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6b6b6b;
  white-space: nowrap;
  border-bottom: 1px solid #f0f0f0;
}

.compare-table__product-col {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  min-width: 200px;
}

.compare-table__value-col {
  padding: 12px 16px;
  text-align: center;
  font-size: 0.875rem;
  color: #1a1a1a;
  border-bottom: 1px solid #f0f0f0;
}

.compare-table__value-col--highlight {
  font-weight: 700;
  color: #b91c1c;
  font-size: 1rem;
}

/* 产品卡片 */
.compare-product-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.compare-product-card__img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.compare-product-card__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a1a;
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.compare-product-card__name:hover {
  color: var(--f-brand, #e8532d);
}

.compare-product-card__price {
  font-size: 1.125rem;
  font-weight: 700;
  color: #b91c1c;
}

/* 响应式：移动端堆叠 */
@media (max-width: 768px) {
  .compare-table__label-col {
    width: 80px;
    padding: 10px 8px;
    font-size: 0.75rem;
  }
  .compare-table__product-col {
    min-width: 140px;
    padding: 12px 8px;
  }
  .compare-product-card__img {
    width: 80px;
    height: 80px;
  }
}
</style>
