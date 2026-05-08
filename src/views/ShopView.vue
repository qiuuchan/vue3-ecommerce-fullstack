<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { fetchShopDetail, fetchShopProducts } from '@/api/shop';
import GoodsCard from '@/components/GoodsCard.vue';
import type { Product } from '@/types/product';
import type { ShopPublic } from '@/types/shop';
import { useAppI18n } from '@/composables/useAppI18n';
import SkeletonLoader from '@/components/SkeletonLoader.vue';
import { translateCreditLevel } from '@/utils/creditI18n';

const { t, locale } = useAppI18n();

const creditDisplay = computed(() => translateCreditLevel(shop.value?.shopCreditLevel, locale.value));
const route = useRoute();
const shop = ref<ShopPublic | null>(null);
const goods = ref<Product[]>([]);
const loading = ref(true);
const errorMsg = ref('');

const shopId = computed(() => Number(route.params.id));

const loadAll = async (): Promise<void> => {
  loading.value = true;
  errorMsg.value = '';
  try {
    const [s, plist] = await Promise.all([fetchShopDetail(shopId.value), fetchShopProducts(shopId.value)]);
    shop.value = s;
    goods.value = plist;
  } catch (error) {
    errorMsg.value = error instanceof Error ? error.message : t('shop.loadFail');
    shop.value = null;
    goods.value = [];
  } finally {
    loading.value = false;
  }
};

watch(
  () => route.params.id,
  () => {
    void loadAll();
  }
);

onMounted(() => {
  void loadAll();
});
</script>

<template>
  <div class="shop-page">
    <div v-if="loading" class="shop-state">
      <SkeletonLoader type="article" />
    </div>
    <div v-else-if="errorMsg" class="shop-state shop-state--error">
      {{ errorMsg }}
      <button type="button" class="shop-retry" @click="loadAll">
        {{ t('common.retry') }}
      </button>
    </div>
    <template v-else-if="shop">
      <header class="shop-hero" :style="shop.banner ? { backgroundImage: `url(${shop.banner})` } : {}">
        <div class="shop-hero__mask" />
        <div class="shop-hero__inner">
          <img v-if="shop.logo" :src="shop.logo" :alt="shop.name" class="shop-logo">
          <div>
            <h1 class="shop-name">
              {{ shop.name }}
            </h1>
            <p class="shop-tagline">
              {{ shop.tagline || t('shop.defaultTagline') }}
            </p>
            <div class="shop-badges">
              <span class="badge">{{ creditDisplay }}</span>
              <span v-if="shop.isPremiumShop" class="badge badge--premium">{{ t('shop.badgePremium') }}</span>
              <span class="badge">{{ t('shop.followers') }} {{ shop.followerCount ?? 0 }}</span>
              <span class="badge">{{ t('shop.onSale') }} {{ shop.productCountOnSale ?? goods.length }}</span>
            </div>
          </div>
        </div>
      </header>

      <p class="shop-desc">
        {{ shop.description }}
      </p>

      <h2 class="shop-section-title">
        {{ t('shop.goodsTitle') }}
      </h2>
      <div v-if="goods.length === 0" class="shop-empty">
        {{ t('shop.empty') }}
      </div>
      <div v-else class="goods-grid">
        <GoodsCard
          v-for="item in goods"
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
    </template>
  </div>
</template>

<style scoped>
.shop-page {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 48px;
}

.shop-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--f-text-muted, #64748b);
}

.shop-state--error {
  color: #e11d48;
}

.shop-retry {
  margin-top: 12px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--f-border, #e8e5e0);
  background: #fff;
  cursor: pointer;
}

.shop-hero {
  position: relative;
  min-height: 200px;
  background-size: cover;
  background-position: center;
  background-color: #1a1a2e;
  border-radius: 0 0 var(--f-radius, 12px) var(--f-radius, 12px);
  overflow: hidden;
  margin-bottom: 20px;
}

.shop-hero__mask {
  position: absolute;
  inset: 0;
  /* 单层半透明，避免花哨渐变 */
  background: rgba(0, 0, 0, 0.45);
}

.shop-hero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 32px 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.shop-logo {
  width: 88px;
  height: 88px;
  border-radius: 16px;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, .4);
  flex-shrink: 0;
}

.shop-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, .3);
}

.shop-tagline {
  margin-top: 6px;
  font-size: .9rem;
  color: rgba(255, 255, 255, .85);
}

.shop-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.badge {
  font-size: .72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, .2);
  color: #fff;
  backdrop-filter: blur(6px);
}

.badge--premium {
  background: rgba(245, 158, 11, .45);
  border: 1px solid rgba(255, 255, 255, .35);
}

.shop-desc {
  padding: 0 20px;
  font-size: .9rem;
  color: var(--f-text-muted, #64748b);
  line-height: 1.7;
  max-width: 1200px;
  margin: 0 auto 24px;
}

.shop-section-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--f-text, #1a1a2e);
  padding: 0 20px;
  margin-bottom: 16px;
}

.shop-empty {
  text-align: center;
  padding: 40px;
  color: var(--f-text-muted, #64748b);
}
</style>
