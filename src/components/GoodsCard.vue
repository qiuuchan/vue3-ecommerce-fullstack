<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Star, StarFilled, Picture } from '@element-plus/icons-vue';
import LazyImage from '@/components/LazyImage.vue';
import { favoriteProductApi, submitProductRatingApi, unfavoriteProductApi } from '@/api/product';
import type { StarRating } from '@/constants/rating';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';
import { useCompareStore } from '@/stores/compareStore';
import { useAppI18n } from '@/composables/useAppI18n';
import { formatCurrency, type AppLocaleTag } from '@/utils/formatLocale';
import { translateCreditLevel } from '@/utils/creditI18n';
import { toastError } from '@/utils/toast';
import { useCartAnimation } from '@/composables/useCartAnimation';

interface GoodsCardProps {
  id: number;
  shopId?: number;
  name: string;
  price: number;
  cover?: string;
  shopName?: string;
  favoriteCount?: number;
  goodReviewCount?: number;
  avgRating?: number;
  isPremiumProduct?: boolean;
  myRating?: number;
  canRate?: boolean;
  shopGoodReviewCount?: number;
  shopCreditLevel?: string;
  isFavorite?: boolean;
}

const props = defineProps<GoodsCardProps>();

const cartStore = useCartStore();
const userStore = useUserStore();
const compareStore = useCompareStore();
const router = useRouter();
const route = useRoute();
const { t, locale } = useAppI18n();
const { animateToCart } = useCartAnimation();

// 商品图片 ref，用于飞入动画起始位置
const coverRef = ref<HTMLElement | null>(null);

const adding = ref(false);
const added = ref(false);
const favoriteLoading = ref(false);
const reviewLoading = ref(false);

const currentFavoriteCount = ref(props.favoriteCount || 0);
const currentRatingCount = ref(props.goodReviewCount || 0);
const currentAvg = ref(props.avgRating ?? 0);
const currentIsFavorite = ref(Boolean(props.isFavorite));
const currentMyRating = ref(props.myRating);
const currentPremium = ref(Boolean(props.isPremiumProduct));

watch(
  () => props.favoriteCount,
  (val) => {
    currentFavoriteCount.value = val || 0;
  }
);

watch(
  () => props.goodReviewCount,
  (val) => {
    currentRatingCount.value = val || 0;
  }
);

watch(
  () => props.avgRating,
  (val) => {
    currentAvg.value = val ?? 0;
  }
);

watch(
  () => props.isFavorite,
  (val) => {
    currentIsFavorite.value = Boolean(val);
  }
);

watch(
  () => props.myRating,
  (val) => {
    currentMyRating.value = val;
  }
);

watch(
  () => props.isPremiumProduct,
  (val) => {
    currentPremium.value = Boolean(val);
  }
);

const emit = defineEmits<{ (e: 'add-to-cart'): void }>();

const creditLevel = computed(() => {
  void locale.value;
  return translateCreditLevel(props.shopCreditLevel, locale.value) || t('card.shopDefault');
});

// 价格按当前界面语言做货币格式化（Intl）
const priceLocale = computed((): AppLocaleTag => (locale.value === 'en-US' ? 'en-US' : 'zh-CN'));
const priceDisplay = computed(() => formatCurrency(props.price, priceLocale.value));

const isGuest = computed(() => userStore.isGuest);

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

const handleAddToCart = async (): Promise<void> => {
  if (!requireLogin()) return;
  if (adding.value) return;
  adding.value = true;
  const ok = await cartStore.addGoods({ id: props.id, name: props.name, price: props.price });
  adding.value = false;
  if (ok) {
    added.value = true;
    emit('add-to-cart');
    // 触发飞入动画
    if (coverRef.value) {
      void animateToCart(coverRef.value);
    }
    setTimeout(() => {
      added.value = false;
    }, 1800);
  }
};

const isInCompare = computed(() => compareStore.hasItem(props.id));

const handleToggleCompare = (): void => {
  const product = {
    id: props.id,
    name: props.name,
    price: props.price,
    originalPrice: props.price * 1.3, // approximate
    cover: props.cover,
    shopName: props.shopName,
    shopCreditLevel: props.shopCreditLevel || 'normal',
    categoryName: '',
    sales: 0,
    stock: 0,
    avgRating: props.avgRating || 0,
    ratingCount: 0,
    favoriteCount: props.favoriteCount || 0,
    isPremiumProduct: props.isPremiumProduct || false,
  };
  compareStore.toggleItem(product as any);
};

const handleToggleFavorite = async (): Promise<void> => {
  if (!requireLogin()) return;
  if (favoriteLoading.value) return;
  favoriteLoading.value = true;
  try {
    const nextProduct = currentIsFavorite.value
      ? await unfavoriteProductApi(props.id)
      : await favoriteProductApi(props.id);
    currentIsFavorite.value = Boolean(nextProduct.isFavorite);
    currentFavoriteCount.value = nextProduct.favoriteCount || 0;
  } catch (error) {
    toastError(error instanceof Error ? error.message : t('card.favFail'));
  } finally {
    favoriteLoading.value = false;
  }
};

const handleStar = async (stars: StarRating): Promise<void> => {
  if (!requireLogin()) return;
  if (reviewLoading.value || props.canRate === false) return;
  reviewLoading.value = true;
  try {
    const nextProduct = await submitProductRatingApi(props.id, stars);
    currentRatingCount.value = nextProduct.goodReviewCount || nextProduct.ratingCount || 0;
    currentAvg.value = nextProduct.avgRating ?? 0;
    currentMyRating.value = nextProduct.myRating;
    currentPremium.value = Boolean(nextProduct.isPremiumProduct);
  } catch (error) {
    toastError(error instanceof Error ? error.message : t('card.rateFail'));
  } finally {
    reviewLoading.value = false;
  }
};

const myRatingLabel = computed(() => {
  void locale.value;
  const r = currentMyRating.value;
  if (!r || r < 1 || r > 5) return '';
  return t(`star.${r}` as 'star.1');
});
</script>

<template>
  <article class="goods-card">
    <div ref="coverRef" class="goods-card__cover">
      <router-link :to="`/products/${props.id}`" class="goods-card__media-link">
        <LazyImage
          v-if="props.cover"
          :src="props.cover"
          :alt="props.name"
          aspect-ratio="1"
          webp
          class="goods-card__lazy-img"
        />
        <div v-else class="goods-card__placeholder">
          <el-icon :size="40" class="goods-card__placeholder-icon" aria-hidden="true">
            <Picture />
          </el-icon>
        </div>
      </router-link>
      <div class="goods-card__overlay" />
      <span class="goods-card__tag">{{ t('card.hot') }}</span>
      <span v-if="currentPremium" class="goods-card__tag goods-card__tag--premium">{{ t('card.premium') }}</span>

      <button
        type="button"
        class="goods-card__favorite"
        :class="{ 'goods-card__favorite--active': currentIsFavorite }"
        :disabled="favoriteLoading"
        @click.stop="handleToggleFavorite"
      >
        <el-icon :size="18" aria-hidden="true">
          <StarFilled v-if="currentIsFavorite" />
          <Star v-else />
        </el-icon>
      </button>

      <button
        type="button"
        class="goods-card__compare"
        :class="{ 'goods-card__compare--active': isInCompare }"
        :title="t('compare.addToCompare')"
        @click.stop="handleToggleCompare"
      >
        <span class="goods-card__compare-icon">⇆</span>
      </button>
    </div>

    <div class="goods-card__body">
      <p v-if="props.shopId" class="goods-card__shop">
        <router-link :to="`/shops/${props.shopId}`" class="goods-card__shop-link" @click.stop>
          {{ props.shopName || t('card.officialShop') }}
        </router-link>
      </p>
      <p v-else class="goods-card__shop">
        {{ props.shopName || t('card.officialShop') }}
      </p>
      <h3 class="goods-card__name">
        <router-link :to="`/products/${props.id}`" class="goods-card__title-link" @click.stop>
          {{ props.name }}
        </router-link>
      </h3>

      <div class="goods-card__meta">
        <span class="goods-card__price">
          {{ priceDisplay }}
        </span>
        <span class="goods-card__credit">{{ creditLevel }}</span>
      </div>

      <div class="goods-card__rating-line">
        <span>{{ t('card.avg') }} {{ currentAvg > 0 ? currentAvg.toFixed(1) : t('card.dash') }}</span>
        <span>{{ currentRatingCount }} {{ t('card.reviews') }}</span>
      </div>

      <div v-if="isGuest" class="goods-card__guest-hint" @click="goLogin">
        {{ t('card.guestHint') }}
      </div>

      <div v-else class="goods-card__stars">
        <span v-if="myRatingLabel" class="goods-card__rated">{{ t('card.rated') }}{{ myRatingLabel }}</span>
        <span v-else class="goods-card__rated goods-card__rated--muted">{{ t('card.tapStars') }}</span>
        <div class="star-btns">
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            class="star-btns__item"
            :class="{ 'star-btns__item--on': currentMyRating === n }"
            :disabled="reviewLoading || canRate === false"
            :title="t(`star.${n}` as 'star.1')"
            @click="handleStar(n as StarRating)"
          >
            ★
          </button>
        </div>
      </div>

      <div class="goods-card__stats">
        <span class="goods-card__stat-text">{{ t('card.favorites') }} {{ currentFavoriteCount }}</span>
        <span class="goods-card__stat-text">{{ t('card.shopPraise') }} {{ props.shopGoodReviewCount || 0 }}</span>
      </div>
    </div>

    <button
      type="button"
      class="goods-card__btn"
      :class="{ 'goods-card__btn--added': added, 'goods-card__btn--loading': adding }"
      :disabled="adding"
      @click="handleAddToCart"
    >
      <span v-if="adding" class="btn-spinner" />
      <span v-else-if="added">{{ t('card.added') }}</span>
      <span v-else>{{ t('card.addCart') }}</span>
    </button>
  </article>
</template>

<style scoped>
.goods-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--f-surface, rgba(255, 255, 255, .05));
  border: 1px solid var(--f-border, var(--c-border));
  border-radius: var(--f-radius, var(--r-md));
  overflow: hidden;
  transition: transform var(--t-spring), box-shadow var(--t-med), border-color var(--t-med);
}

.goods-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #bdbdbd;
}

.goods-card__cover {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f5f5f5;
}

.goods-card__media-link {
  position: absolute;
  inset: 0;
  display: block;
  z-index: 0;
}

.goods-card__lazy-img {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.goods-card__lazy-img :deep(.lazy-image__img) {
  transition: transform .5s ease;
}

.goods-card:hover .goods-card__lazy-img :deep(.lazy-image__img) {
  transform: scale(1.06);
}

.goods-card__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ebebeb;
}

.goods-card__placeholder-icon {
  color: var(--f-text-subtle, #9a9a9a);
}

.goods-card__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: transparent;
  pointer-events: none;
}

.goods-card__tag {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  padding: 4px 8px;
  font-size: .625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: var(--f-brand, #e8532d);
  border: 1px solid var(--f-brand, #e8532d);
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(232,83,45,.35);
}

.goods-card__tag--premium {
  top: 40px;
  color: var(--f-text, #1a1a1a);
  background: rgba(255, 255, 255, 0.92);
  border-color: var(--f-border, #e5e5e5);
  box-shadow: none;
}

.goods-card__favorite {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 3;
  width: 34px;
  height: 34px;
  border: 1px solid var(--f-border, #e5e5e5);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.95);
  color: var(--f-text-muted, #6b6b6b);
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.goods-card__favorite--active {
  color: #fff;
  background: var(--f-brand, #e8532d);
  border-color: var(--f-brand, #e8532d);
  animation: heart-pop 0.35s cubic-bezier(.34,1.56,.64,1);
}

@keyframes heart-pop {
  0% { transform: scale(1); }
  40% { transform: scale(1.25); }
  100% { transform: scale(1); }
}

.goods-card__compare {
  position: absolute;
  top: 10px;
  right: 50px;
  z-index: 3;
  width: 34px;
  height: 34px;
  border: 1px solid var(--f-border, #e5e5e5);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.95);
  color: var(--f-text-muted, #6b6b6b);
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.goods-card__compare:hover {
  border-color: var(--f-brand, #e8532d);
  color: var(--f-brand, #e8532d);
}

.goods-card__compare--active {
  background: var(--f-brand, #e8532d);
  border-color: var(--f-brand, #e8532d);
  color: #fff;
}

.goods-card__compare-icon {
  line-height: 1;
}

.goods-card__body {
  padding: 14px 16px 10px;
  flex: 1;
}

.goods-card__shop {
  font-size: .72rem;
  color: var(--f-text-muted, var(--c-text-muted));
  margin-bottom: 6px;
}

.goods-card__shop-link {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
}

.goods-card__shop-link:hover {
  color: var(--f-text, #1a1a1a);
}

.goods-card__name {
  font-size: .9375rem;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-card__title-link {
  color: var(--f-text, var(--c-text));
  text-decoration: none;
}

.goods-card__title-link:hover {
  color: var(--f-text-muted, #6b6b6b);
}

.goods-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.goods-card__price {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--f-text, #1a1a1a);
}

.price-symbol {
  font-size: .8rem;
  margin-right: 2px;
}

.goods-card__credit {
  font-size: .6875rem;
  color: var(--f-text-muted, #6b6b6b);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.goods-card__rating-line {
  display: flex;
  justify-content: space-between;
  font-size: .68rem;
  color: var(--f-text-muted, #64748b);
  margin-top: 8px;
}

.goods-card__guest-hint {
  margin-top: 10px;
  padding: 8px;
  font-size: .72rem;
  text-align: center;
  color: var(--f-text-muted, #6b6b6b);
  background: #fafafa;
  border: 1px solid var(--f-border, #e5e5e5);
  border-radius: 4px;
  cursor: pointer;
}

.goods-card__stars {
  margin-top: 10px;
}

.goods-card__rated {
  display: block;
  font-size: .68rem;
  font-weight: 600;
  color: var(--f-text, #1a1a2e);
  margin-bottom: 4px;
}

.goods-card__rated--muted {
  color: var(--f-text-muted, #64748b);
  font-weight: 500;
}

.star-btns {
  display: flex;
  gap: 2px;
}

.star-btns__item {
  flex: 1;
  padding: 4px 0;
  border: 1px solid var(--f-border, #e8e5e0);
  border-radius: 6px;
  background: #fff;
  color: #cbd5e1;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: color .15s, border-color .15s, background .15s;
}

.star-btns__item:hover:not(:disabled) {
  color: var(--f-text, #1a1a1a);
  border-color: #bdbdbd;
}

.star-btns__item--on {
  color: var(--f-text, #1a1a1a);
  border-color: var(--f-text, #1a1a1a);
  background: rgba(0, 0, 0, 0.04);
}

.star-btns__item:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.goods-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.goods-card__stat-text {
  padding: 4px 8px;
  border-radius: 999px;
  font-size: .68rem;
  line-height: 1;
  background: rgba(0, 0, 0, .04);
  color: var(--f-text-muted, var(--c-text-muted));
}

.goods-card__btn {
  margin: 0 16px 16px;
  height: 40px;
  background: var(--f-primary, #1a1a1a);
  color: #fff;
  font-family: var(--font-sans);
  font-size: .8125rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: none;
  transition: background var(--t-med), transform 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.goods-card__btn:hover:not(:disabled) {
  background: var(--f-brand-hover, #c94522);
  transform: translateY(-1px);
}
.goods-card__btn:active:not(:disabled) {
  transform: scale(.97);
}
.goods-card__btn--added {
  background: #2d6a4f !important;
  box-shadow: 0 4px 12px rgba(45,106,79,.35) !important;
  animation: btn-success 0.4s ease;
}

@keyframes btn-success {
  0% { transform: scale(1); }
  30% { transform: scale(1.04); }
  100% { transform: scale(1); }
}
.goods-card__btn--loading {
  opacity: .75;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
