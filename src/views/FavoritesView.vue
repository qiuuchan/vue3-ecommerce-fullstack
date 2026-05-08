<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Star } from '@element-plus/icons-vue';
import { fetchFavoriteProductsApi } from '@/api/user';
import GoodsCard from '@/components/GoodsCard.vue';
import type { Product } from '@/types/product';
import { useAppI18n } from '@/composables/useAppI18n';

const { t } = useAppI18n();
const list = ref<Product[]>([]);
const loading = ref(true);
const errorMsg = ref('');

const loadFavorites = async (): Promise<void> => {
  loading.value = true;
  errorMsg.value = '';
  try {
    list.value = await fetchFavoriteProductsApi();
  } catch (error) {
    errorMsg.value = error instanceof Error ? error.message : t('fav.loadFail');
    list.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void loadFavorites();
});
</script>

<template>
  <div class="fav-page">
    <header class="fav-head">
      <h1 class="fav-title">
        {{ t('fav.title') }}
      </h1>
      <p class="fav-sub">
        {{ t('fav.line', { n: list.length }) }}
      </p>
    </header>

    <div v-if="loading" class="fav-state">
      {{ t('common.loading') }}
    </div>
    <div v-else-if="errorMsg" class="fav-state fav-state--error">
      {{ errorMsg }}
      <button type="button" class="retry" @click="loadFavorites">
        {{ t('common.retry') }}
      </button>
    </div>
    <div v-else-if="list.length === 0" class="fav-empty">
      <span class="fav-empty__icon" aria-hidden="true"><el-icon :size="40"><Star /></el-icon></span>
      <p>{{ t('fav.empty') }}</p>
      <router-link to="/products" class="fav-link">
        {{ t('fav.goList') }}
      </router-link>
    </div>
    <div v-else class="goods-grid">
      <GoodsCard
        v-for="item in list"
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
        @add-to-cart="loadFavorites"
      />
    </div>
  </div>
</template>

<style scoped>
.fav-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.fav-head {
  margin-bottom: 28px;
}

.fav-title {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--f-text, #1a1a1a);
}

.fav-sub {
  margin-top: 6px;
  font-size: .9rem;
  color: var(--f-text-muted, #64748b);
}

.fav-state {
  text-align: center;
  padding: 40px;
  color: var(--f-text-muted, #64748b);
}

.fav-state--error {
  color: #e11d48;
}

.retry {
  margin-top: 12px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--f-border, #e8e5e0);
  background: #fff;
  cursor: pointer;
}

.fav-empty {
  text-align: center;
  padding: 56px 20px;
  background: var(--f-surface, #fff);
  border-radius: var(--f-radius, 6px);
  border: 1px solid var(--f-border, #e5e5e5);
  box-shadow: none;
  color: var(--f-text-muted, #6b6b6b);
}

.fav-empty__icon {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
  color: var(--f-text-subtle, #9a9a9a);
}

.fav-link {
  display: inline-block;
  margin-top: 16px;
  color: var(--f-brand, #e8532d);
  font-weight: 600;
}
</style>
