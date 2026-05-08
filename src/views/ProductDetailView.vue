<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  favoriteProductApi,
  fetchProductDetail,
  submitProductRatingApi,
  unfavoriteProductApi
} from '@/api/product';
import type { StarRating } from '@/constants/rating';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';
import type { Product } from '@/types/product';
import { useAppI18n } from '@/composables/useAppI18n';
import { formatCurrency, type AppLocaleTag } from '@/utils/formatLocale';
import SkeletonLoader from '@/components/SkeletonLoader.vue';
import ProductReviewList from '@/components/ProductReviewList.vue';
import SkuSelector from '@/components/SkuSelector.vue';
import type { SkuVariant } from '@/types/product';
import { translateCreditLevel } from '@/utils/creditI18n';
import { toastSuccess, toastError } from '@/utils/toast';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const userStore = useUserStore();
const { t, locale } = useAppI18n();

const creditDisplay = computed(() => translateCreditLevel(product.value?.shopCreditLevel, locale.value));

const priceLocale = computed((): AppLocaleTag => (locale.value === 'en-US' ? 'en-US' : 'zh-CN'));
const detailPriceText = computed(() => {
  const p = selectedSku.value?.price ?? product.value?.price;
  return p != null ? formatCurrency(p, priceLocale.value) : '';
});
const detailOriginText = computed(() =>
  product.value?.originalPrice != null
    ? formatCurrency(product.value.originalPrice, priceLocale.value)
    : ''
);

const product = ref<Product | null>(null);
const loading = ref(true);
const loadError = ref('');
const adding = ref(false);
const favoriteLoading = ref(false);
const reviewLoading = ref(false);
const selectedSku = ref<SkuVariant | null>(null);

const onSkuChange = (variant: SkuVariant | null): void => {
  selectedSku.value = variant;
};

const productId = computed(() => Number(route.params.id));
const isGuest = computed(() => userStore.isGuest);

const loadDetail = async (): Promise<void> => {
  loading.value = true;
  loadError.value = '';
  try {
    product.value = await fetchProductDetail(productId.value);
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : t('common.loadFailed');
    product.value = null;
  } finally {
    loading.value = false;
  }
};

watch(
  () => route.params.id,
  () => {
    void loadDetail();
  }
);

onMounted(() => {
  void loadDetail();
});

const goLogin = (): void => {
  void router.push({ path: '/login', query: { redirect: route.fullPath } });
};

const requireLogin = (): boolean => {
  if (isGuest.value) {
    goLogin();
    return false;
  }
  return true;
};

const handleAddCart = async (): Promise<void> => {
  if (!requireLogin()) return;
  if (!product.value || adding.value) return;
  adding.value = true;
  const skuPrice = selectedSku.value?.price ?? product.value.price;
  const skuLabel = selectedSku.value
    ? ` (${Object.values(selectedSku.value.specValues).join('/')})`
    : '';
  const ok = await cartStore.addGoods({
    id: product.value.id,
    name: product.value.name + skuLabel,
    price: skuPrice
  });
  adding.value = false;
  if (ok) {
    toastSuccess(t('detail.addOk'));
  }
};

const handleFavorite = async (): Promise<void> => {
  if (!requireLogin()) return;
  if (!product.value || favoriteLoading.value) return;
  favoriteLoading.value = true;
  try {
    const next = product.value.isFavorite
      ? await unfavoriteProductApi(product.value.id)
      : await favoriteProductApi(product.value.id);
    product.value = { ...product.value, ...next };
  } catch (error) {
    toastError(error instanceof Error ? error.message : t('detail.favFail'));
  } finally {
    favoriteLoading.value = false;
  }
};

const handleStar = async (stars: StarRating): Promise<void> => {
  if (!requireLogin()) return;
  if (!product.value || reviewLoading.value || product.value.canRate === false) return;
  reviewLoading.value = true;
  try {
    const next = await submitProductRatingApi(product.value.id, stars);
    product.value = { ...product.value, ...next };
  } catch (error) {
    toastError(error instanceof Error ? error.message : t('detail.rateFail'));
  } finally {
    reviewLoading.value = false;
  }
};

const goShop = (): void => {
  if (!product.value?.shopId) return;
  void router.push(`/shops/${product.value.shopId}`);
};

const myRatingLabel = computed(() => {
  void locale.value;
  const p = product.value;
  if (!p?.myRating || p.myRating < 1 || p.myRating > 5) return '';
  return t(`star.${p.myRating}` as 'star.1');
});

const avgDisplay = computed(() => {
  void locale.value;
  const a = product.value?.avgRating ?? 0;
  return a > 0 ? a.toFixed(1) : t('card.dash');
});

const rateTitle = computed(() => {
  void locale.value;
  return myRatingLabel.value
    ? `${t('detail.myRate')}${myRatingLabel.value}`
    : t('detail.ratePrompt');
});
</script>

<template>
  <div class="detail-page">
    <div v-if="loading" class="detail-state">
      <SkeletonLoader type="article" />
    </div>
    <div v-else-if="loadError" class="detail-state detail-state--error">
      <p>{{ loadError }}</p>
      <button type="button" class="f-btn f-btn--ghost" @click="loadDetail">
        {{ t('common.retry') }}
      </button>
    </div>
    <template v-else-if="product">
      <div class="detail-grid">
        <div class="detail-visual">
          <div v-if="product.isPremiumProduct" class="detail-premium-badge">
            {{ t('detail.premium') }}
          </div>
          <img
            v-if="product.cover"
            :src="product.cover"
            :alt="product.name"
            class="detail-cover"
          >
        </div>
        <div class="detail-info">
          <p class="detail-shop" @click="goShop">
            {{ product.shopName || t('card.officialShop') }} →
          </p>
          <h1 class="detail-title">
            {{ product.name }}
          </h1>
          <p class="detail-desc">
            {{ product.description || t('detail.noDesc') }}
          </p>
          <div class="detail-price-row">
            <span class="detail-price">{{ detailPriceText }}</span>
            <span v-if="product.originalPrice" class="detail-origin">{{ detailOriginText }}</span>
            <span class="detail-credit">{{ creditDisplay }}</span>
          </div>
          <!-- 多规格选择 -->
          <SkuSelector
            v-if="product.skuSpecs && product.skuSpecs.length > 0"
            :specs="product.skuSpecs"
            :variants="product.skuVariants || []"
            :base-price="product.price"
            @change="onSkuChange"
          />

          <div class="detail-meta">
            <span>{{ t('detail.stock') }} {{ product.stock ?? t('card.dash') }}</span>
            <span>{{ t('detail.sold') }} {{ product.sales ?? 0 }}</span>
            <span
            >{{ t('detail.avg') }} {{ avgDisplay }}{{ t('detail.reviewWrap', { n: product.goodReviewCount ?? product.ratingCount ?? 0 }) }}</span>
            <span>{{ t('detail.favCount') }} {{ product.favoriteCount ?? 0 }}</span>
          </div>

          <div v-if="isGuest" class="detail-guest" @click="goLogin">
            {{ t('detail.guestTip') }}
          </div>

          <div v-else class="detail-rate-block">
            <p class="detail-rate-title">
              {{ rateTitle }}
            </p>
            <div class="detail-star-row">
              <button
                v-for="n in 5"
                :key="n"
                type="button"
                class="detail-star-btn"
                :class="{ 'detail-star-btn--on': product.myRating === n }"
                :disabled="reviewLoading || product.canRate === false"
                :title="t(`star.${n}` as 'star.1')"
                @click="handleStar(n as StarRating)"
              >
                ★
              </button>
            </div>
          </div>

          <div class="detail-actions">
            <button
              type="button"
              class="f-btn f-btn--primary"
              :disabled="adding"
              @click="handleAddCart"
            >
              {{ adding ? t('detail.adding') : t('detail.addCart') }}
            </button>
            <button
              type="button"
              class="f-btn f-btn--ghost"
              :disabled="favoriteLoading"
              @click="handleFavorite"
            >
              {{ product.isFavorite ? t('detail.favorited') : t('detail.favorite') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 评价列表 -->
      <ProductReviewList
        v-if="product"
        :product-id="product.id"
        :avg-rating="product.avgRating"
        :total-count="product.goodReviewCount ?? product.ratingCount"
      />
    </template>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

.detail-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--f-text-muted, #64748b);
}

.detail-state--error {
  color: #e11d48;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 32px;
  align-items: start;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

.detail-visual {
  position: relative;
  border-radius: var(--f-radius, 6px);
  overflow: hidden;
  background: var(--f-surface, #fff);
  border: 1px solid var(--f-border, #e5e5e5);
  box-shadow: none;
}

.detail-premium-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  padding: 5px 10px;
  font-size: .625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--f-text, #1a1a1a);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--f-border, #e5e5e5);
  border-radius: 4px;
}

.detail-cover {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.detail-shop {
  font-size: .8125rem;
  color: var(--f-text-muted, #6b6b6b);
  cursor: pointer;
  margin-bottom: 8px;
}

.detail-title {
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--f-text, #1a1a1a);
  margin-bottom: 12px;
  line-height: 1.35;
}

.detail-desc {
  font-size: .9rem;
  color: var(--f-text-muted, #64748b);
  line-height: 1.7;
  margin-bottom: 20px;
}

.detail-price-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.detail-price {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--f-text, #1a1a1a);
}

.detail-origin {
  font-size: .9rem;
  text-decoration: line-through;
  color: var(--f-text-subtle, #94a3b8);
}

.detail-credit {
  font-size: .6875rem;
  padding: 4px 10px;
  border-radius: 4px;
  background: #fafafa;
  border: 1px solid var(--f-border, #e5e5e5);
  color: var(--f-text-muted, #6b6b6b);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  font-size: .8rem;
  color: var(--f-text-muted, #64748b);
  margin-bottom: 16px;
}

.detail-guest {
  padding: 12px 14px;
  margin-bottom: 16px;
  font-size: .8125rem;
  color: var(--f-text-muted, #6b6b6b);
  background: #fafafa;
  border: 1px solid var(--f-border, #e5e5e5);
  border-radius: 4px;
  cursor: pointer;
}

.detail-rate-block {
  margin-bottom: 20px;
}

.detail-rate-title {
  font-size: .85rem;
  font-weight: 600;
  color: var(--f-text, #1a1a2e);
  margin-bottom: 8px;
}

.detail-star-row {
  display: flex;
  gap: 8px;
}

.detail-star-btn {
  width: 44px;
  height: 44px;
  font-size: 1.35rem;
  border: 1px solid var(--f-border, #e8e5e0);
  border-radius: 10px;
  background: #fff;
  color: #cbd5e1;
  cursor: pointer;
  transition: color .15s, border-color .15s, background .15s;
}

.detail-star-btn:hover:not(:disabled) {
  color: var(--f-text, #1a1a1a);
  border-color: #bdbdbd;
}

.detail-star-btn--on {
  color: var(--f-text, #1a1a1a);
  border-color: var(--f-text, #1a1a1a);
  background: rgba(0, 0, 0, 0.04);
}

.detail-star-btn:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.f-btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: .875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity .2s, transform .15s;
}

.f-btn:active:not(:disabled) {
  transform: scale(.98);
}

.f-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.f-btn--primary {
  background: var(--f-primary, #e8532d);
  color: #fff;
  box-shadow: 0 2px 8px rgba(232, 83, 45, 0.25);
  border-radius: 6px;
  transition: background .2s, box-shadow .2s, transform .15s ease;
}

.f-btn--primary:hover:not(:disabled) {
  background: var(--f-brand-hover, #c94522);
  box-shadow: 0 4px 16px rgba(232, 83, 45, 0.35);
  transform: translateY(-1px);
}

.f-btn--ghost {
  background: var(--f-surface, #fff);
  color: var(--f-text, #1a1a2e);
  border: 1px solid var(--f-border, #e8e5e0);
}
</style>
