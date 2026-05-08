<script setup lang="ts">
import type { Component } from 'vue';
import { computed, onMounted } from 'vue';
import {
  Apple,
  MilkTea,
  Goods,
  Location,
  CircleCheck,
  Promotion,
  Present,
  Search,
  Shop,
  Medal,
  Van,
  Headset,
  Connection,
  StarFilled,
  ShoppingCart
} from '@element-plus/icons-vue';
import { useAppI18n } from '@/composables/useAppI18n';
import { formatCurrency } from '@/utils/formatLocale';
import { useHomeStore } from '@/stores/homeStore';
import type { Product } from '@/types/product';
import LazyImage from '@/components/LazyImage.vue';
import SkeletonCard from '@/components/SkeletonCard.vue';

defineOptions({ name: 'HomeView' });

const { t, locale } = useAppI18n();
const homeStore = useHomeStore();

const flashTag = (p: Product): string => {
  const orig = p.originalPrice ?? 0;
  if (orig > p.price) {
    const pct = Math.max(1, Math.round((1 - p.price / orig) * 100));
    return t('home.flashTagOff', { pct });
  }
  return t('home.flashTagDeal');
};

const discountPct = (p: Product): number => {
  const orig = p.originalPrice ?? 0;
  if (orig > p.price) return Math.max(1, Math.round((1 - p.price / orig) * 100));
  return 0;
};

onMounted(() => {
  if (homeStore.products.length === 0) {
    void homeStore.loadProducts();
  }
});

const categories = computed<{ name: string; Icon: Component }[]>(() => [
  { name: t('home.category1'), Icon: Apple },
  { name: t('home.category2'), Icon: MilkTea },
  { name: t('home.category3'), Icon: Goods },
  { name: t('home.category4'), Icon: Location }
]);

const trustBarItems: { Icon: Component; msgKey: string }[] = [
  { Icon: Medal, msgKey: 'home.trust1' },
  { Icon: Van, msgKey: 'home.trust2' },
  { Icon: Headset, msgKey: 'home.trust3' },
  { Icon: Connection, msgKey: 'home.trust4' }
];

type ShopHighlightKey = 'home.shopHighlight1' | 'home.shopHighlight2' | 'home.shopHighlight3';

const shops = computed<{
  name: string;
  credit: string;
  goodsCount: number;
  desc: string;
  highlightKey: ShopHighlightKey;
}[]>(() => [
  { name: t('home.shop1Name'), credit: t('credit.crown'), goodsCount: 126, desc: t('home.shop1Desc'), highlightKey: 'home.shopHighlight1' },
  { name: t('home.shop2Name'), credit: t('credit.diamond'), goodsCount: 89, desc: t('home.shop2Desc'), highlightKey: 'home.shopHighlight2' },
  { name: t('home.shop3Name'), credit: t('credit.crown'), goodsCount: 64, desc: t('home.shop3Desc'), highlightKey: 'home.shopHighlight3' }
]);

const advantages = computed((): { Icon: Component; title: string; desc: string }[] => [
  { Icon: CircleCheck, title: t('home.adv1.title'), desc: t('home.adv1.desc') },
  { Icon: Promotion, title: t('home.adv2.title'), desc: t('home.adv2.desc') },
  { Icon: Present, title: t('home.adv3.title'), desc: t('home.adv3.desc') },
  { Icon: Search, title: t('home.adv4.title'), desc: t('home.adv4.desc') }
]);
</script>

<template>
  <div class="home">

    <!-- ① Hero Banner -->
    <section class="hero-banner">
      <div class="hero-banner__grid">
        <div class="hero-banner__content">
          <span class="hero-banner__tag">{{ t('home.heroTag') }}</span>
          <h1 class="hero-banner__title">{{ t('home.heroTitle') }}</h1>
          <p class="hero-banner__sub">{{ t('home.heroSub') }}</p>
          <div class="hero-banner__actions">
            <router-link to="/products" class="hero-btn hero-btn--primary">
              {{ t('home.btnBrowse') }}
            </router-link>
            <router-link to="/products" class="hero-btn hero-btn--outline">
              {{ t('home.btnDeals') }}
            </router-link>
          </div>
          <div class="hero-banner__stats">
            <div class="hero-stat"><strong>3,000+</strong><span>{{ t('home.statProducts') }}</span></div>
            <div class="hero-stat"><strong>31</strong><span>{{ t('home.statProvinces') }}</span></div>
            <div class="hero-stat"><strong>48h</strong><span>{{ t('home.statDelivery') }}</span></div>
            <div class="hero-stat"><strong>{{ t('home.statUsersValue') }}</strong><span>{{ t('home.statUsers') }}</span></div>
          </div>
        </div>

        <aside class="hero-banner__aside">
          <div v-if="homeStore.loading" class="hero-mosaic" role="presentation">
            <div class="hero-mosaic__cell hero-mosaic__cell--tall hero-mosaic__cell--skeleton" />
            <div class="hero-mosaic__cell hero-mosaic__cell--skeleton" />
            <div class="hero-mosaic__cell hero-mosaic__cell--skeleton" />
          </div>
          <div v-else class="hero-mosaic">
            <router-link
              v-if="homeStore.heroMosaicProducts[0]"
              :to="`/products/${homeStore.heroMosaicProducts[0].id}`"
              class="hero-mosaic__cell hero-mosaic__cell--tall hero-mosaic__link"
            >
              <LazyImage
                :src="homeStore.heroMosaicProducts[0].cover || ''"
                :alt="homeStore.heroMosaicProducts[0].name"
                aspect-ratio="1"
                class="hero-mosaic__img"
              />
            </router-link>
            <div v-else class="hero-mosaic__cell hero-mosaic__cell--tall hero-mosaic__cell--empty">
              <span class="hero-mosaic__deco" aria-hidden="true" />
            </div>

            <router-link
              v-if="homeStore.heroMosaicProducts[1]"
              :to="`/products/${homeStore.heroMosaicProducts[1].id}`"
              class="hero-mosaic__cell hero-mosaic__link"
            >
              <LazyImage
                :src="homeStore.heroMosaicProducts[1].cover || ''"
                :alt="homeStore.heroMosaicProducts[1].name"
                aspect-ratio="1"
                class="hero-mosaic__img"
              />
            </router-link>
            <div v-else class="hero-mosaic__cell hero-mosaic__cell--empty">
              <span class="hero-mosaic__deco hero-mosaic__deco--sm" aria-hidden="true" />
            </div>

            <router-link
              v-if="homeStore.heroMosaicProducts[2]"
              :to="`/products/${homeStore.heroMosaicProducts[2].id}`"
              class="hero-mosaic__cell hero-mosaic__link"
            >
              <LazyImage
                :src="homeStore.heroMosaicProducts[2].cover || ''"
                :alt="homeStore.heroMosaicProducts[2].name"
                aspect-ratio="1"
                class="hero-mosaic__img"
              />
            </router-link>
            <div v-else class="hero-mosaic__cell hero-mosaic__cell--empty">
              <span class="hero-mosaic__deco hero-mosaic__deco--sm" aria-hidden="true" />
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- 信任窄条 -->
    <section class="home-trust-bar" :aria-label="t('home.trustAria')">
      <div v-for="row in trustBarItems" :key="row.msgKey" class="home-trust-bar__item">
        <el-icon class="home-trust-bar__icon" :size="18" aria-hidden="true">
          <component :is="row.Icon" />
        </el-icon>
        <span class="home-trust-bar__text">{{ t(row.msgKey) }}</span>
      </div>
    </section>

    <!-- ② 分类入口 -->
    <section class="section category-section">
      <div class="section__header">
        <div class="section__header-main">
          <h2 class="section__title">{{ t('home.catTitle') }}</h2>
          <p class="section__lead">{{ t('home.lead.cat') }}</p>
        </div>
        <router-link to="/products" class="section__more">{{ t('home.catMore') }}</router-link>
      </div>
      <div class="category-grid">
        <router-link v-for="(cat, i) in categories" :key="i" to="/products" class="category-item">
          <div class="category-item__icon">
            <el-icon :size="22" class="category-item__icon-el" aria-hidden="true">
              <component :is="cat.Icon" />
            </el-icon>
          </div>
          <span class="category-item__name">{{ cat.name }}</span>
        </router-link>
      </div>
    </section>

    <!-- ③ 限时特惠 -->
    <section class="section flash-section">
      <div class="section__header section__header--flash">
        <div class="section__header-main">
          <h2 class="section__title">
            <span class="flash-dot" />{{ t('home.flashTitle') }}
          </h2>
          <p class="section__lead">{{ t('home.lead.flash') }}</p>
        </div>
        <span class="flash-tip">{{ t('home.flashTip') }}</span>
      </div>
      <p v-if="homeStore.error" class="home-products__error">{{ homeStore.error }}</p>
      <div v-else-if="homeStore.loading" class="flash-scroll">
        <SkeletonCard v-for="i in 6" :key="i" :rows="3" />
      </div>
      <div v-else-if="homeStore.flashSaleItems.length === 0" class="home-products__empty">{{ t('home.emptyProducts') }}</div>
      <div v-else class="flash-scroll">
        <router-link
          v-for="item in homeStore.flashSaleItems"
          :key="item.id"
          :to="`/products/${item.id}`"
          class="flash-card"
        >
          <div class="flash-card__img">
            <LazyImage :src="item.cover || ''" :alt="item.name" aspect-ratio="1" class="flash-card__cover" />
            <span class="flash-card__tag">{{ flashTag(item) }}</span>
            <span v-if="discountPct(item) > 0" class="flash-card__discount">-{{ discountPct(item) }}%</span>
          </div>
          <div class="flash-card__body">
            <p class="flash-card__name">{{ item.name }}</p>
            <div class="flash-card__rating">
              <el-icon v-for="n in 5" :key="n" :size="12" :class="['flash-card__star', n <= Math.round(item.avgRating ?? 5) ? 'is-active' : '']">
                <StarFilled />
              </el-icon>
              <span class="flash-card__sales">{{ item.sales ?? 0 }} {{ t('home.soldPrefix') }}</span>
            </div>
            <div class="flash-card__price-row">
              <span class="flash-card__price">{{ formatCurrency(Number(item.price), locale) }}</span>
              <span v-if="(item.originalPrice ?? 0) > item.price" class="flash-card__original">{{ formatCurrency(Number(item.originalPrice), locale) }}</span>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <!-- ④ 热门推荐 -->
    <section class="section">
      <div class="section__header">
        <div class="section__header-main">
          <h2 class="section__title">{{ t('home.hotTitle') }}</h2>
          <p class="section__lead">{{ t('home.lead.hot') }}</p>
        </div>
        <router-link to="/products" class="section__more">{{ t('home.hotMore') }}</router-link>
      </div>
      <p v-if="homeStore.error" class="home-products__error">{{ homeStore.error }}</p>
      <div v-else-if="homeStore.loading" class="product-grid">
        <SkeletonCard v-for="i in 8" :key="i" :rows="3" />
      </div>
      <div v-else-if="homeStore.hotProducts.length === 0" class="home-products__empty">{{ t('home.emptyProducts') }}</div>
      <div v-else class="product-grid">
        <router-link
          v-for="item in homeStore.hotProducts"
          :key="item.id"
          :to="`/products/${item.id}`"
          class="product-card"
        >
          <div class="product-card__img">
            <LazyImage :src="item.cover || ''" :alt="item.name" aspect-ratio="1" class="product-card__cover" />
            <div class="product-card__actions">
              <button class="product-card__action-btn" :title="t('home.actionFavorite')" @click.prevent.stop>
                <el-icon :size="16"><StarFilled /></el-icon>
              </button>
              <button class="product-card__action-btn" :title="t('home.actionCart')" @click.prevent.stop>
                <el-icon :size="16"><ShoppingCart /></el-icon>
              </button>
            </div>
          </div>
          <div class="product-card__body">
            <p class="product-card__name">{{ item.name }}</p>
            <div class="product-card__rating">
              <el-icon v-for="n in 5" :key="n" :size="12" :class="['product-card__star', n <= Math.round(item.avgRating ?? 5) ? 'is-active' : '']">
                <StarFilled />
              </el-icon>
              <span class="product-card__sales">{{ item.sales ?? 0 }} {{ t('home.soldPrefix') }}</span>
            </div>
            <div class="product-card__bottom">
              <span class="product-card__price">{{ formatCurrency(Number(item.price), locale) }}</span>
              <span v-if="(item.originalPrice ?? 0) > item.price" class="product-card__original">{{ formatCurrency(Number(item.originalPrice), locale) }}</span>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <!-- ⑤ 店铺推荐 -->
    <section class="section">
      <div class="section__header">
        <div class="section__header-main">
          <h2 class="section__title">{{ t('home.shopTitle') }}</h2>
          <p class="section__lead">{{ t('home.lead.shop') }}</p>
        </div>
      </div>
      <div class="shop-grid">
        <div v-for="(shop, i) in shops" :key="i" class="shop-card">
          <div class="shop-card__avatar" aria-hidden="true">
            <el-icon :size="22"><Shop /></el-icon>
          </div>
          <div class="shop-card__info">
            <h3 class="shop-card__name">{{ shop.name }}</h3>
            <p class="shop-card__desc">{{ shop.desc }}</p>
            <div class="shop-card__meta">
              <span class="shop-card__credit">{{ shop.credit }}</span>
              <span class="shop-card__count">{{ shop.goodsCount }} {{ t('home.shopGoodsSuffix') }}</span>
            </div>
            <p class="shop-card__highlight">{{ t(shop.highlightKey) }}</p>
          </div>
          <router-link to="/products" class="shop-card__enter">{{ t('home.enterShop') }}</router-link>
        </div>
      </div>
    </section>

    <!-- ⑥ 平台优势 -->
    <section class="section">
      <div class="section__header">
        <div class="section__header-main">
          <h2 class="section__title">{{ t('home.whyTitle') }}</h2>
          <p class="section__lead">{{ t('home.lead.why') }}</p>
        </div>
      </div>
      <div class="advantage-grid">
        <div v-for="(adv, i) in advantages" :key="i" class="advantage-card">
          <div class="advantage-card__icon" aria-hidden="true">
            <el-icon :size="22"><component :is="adv.Icon" /></el-icon>
          </div>
          <h3 class="advantage-card__title">{{ adv.title }}</h3>
          <p class="advantage-card__desc">{{ adv.desc }}</p>
        </div>
      </div>
    </section>

    <!-- ⑦ CTA -->
    <section class="cta-section">
      <p class="cta-section__lead">{{ t('home.lead.cta') }}</p>
      <h2 class="cta-section__title">{{ t('home.ctaTitle') }}</h2>
      <p class="cta-section__desc">{{ t('home.ctaDesc') }}</p>
      <router-link to="/products" class="hero-btn hero-btn--primary hero-btn--lg">
        {{ t('home.ctaBtn') }}
      </router-link>
    </section>

  </div>
</template>

<style scoped>
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

.home {
  min-width: 0;
  background-image: radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.022) 1px, transparent 0);
  background-size: 22px 22px;
}

.section {
  margin-bottom: 52px;
}

.section__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 26px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--f-border, #e5e5e5);
}

.section__header-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.section__header--flash {
  align-items: center;
}

.section__header--flash .section__header-main {
  flex: 1;
}

.section__title {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--f-text, #1a1a1a);
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 12px;
  border-left: 2px solid var(--f-brand, #e8532d);
  line-height: 1.3;
}

.section__lead {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  line-height: 1.55;
  color: var(--f-text-muted, #6b6b6b);
  max-width: 36rem;
}

.section__more {
  font-size: .8125rem;
  color: var(--f-text-muted, #6b6b6b);
  text-decoration: none;
  font-weight: 500;
  letter-spacing: 0.02em;
  border-bottom: 1px solid transparent;
  transition: color .2s, border-color .2s;
}

.section__more:hover {
  color: var(--f-text, #1a1a1a);
  border-bottom-color: currentColor;
}

.home-trust-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  padding: 14px 20px;
  margin-bottom: 36px;
  background: var(--f-surface, #fff);
  border: 1px solid var(--f-border, #e5e5e5);
  border-radius: 12px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
}

.home-trust-bar__item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1 1 calc(50% - 12px);
  max-width: 100%;
}

@media (min-width: 640px) {
  .home-trust-bar__item {
    flex: 0 1 auto;
    max-width: none;
  }
}

.home-trust-bar__icon {
  flex-shrink: 0;
  color: var(--f-text-muted, #6b6b6b);
}

.home-trust-bar__text {
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--f-text, #1a1a1a);
  line-height: 1.35;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .home-trust-bar__text {
    white-space: normal;
  }
}

.home-products__error {
  margin: 0;
  padding: 12px 16px;
  font-size: 0.875rem;
  color: #dc2626;
  background: #fef2f2;
  border-radius: 10px;
}

.home-products__empty {
  margin: 0;
  padding: 48px 16px;
  font-size: 0.875rem;
  color: var(--f-text-muted, #6b6b6b);
  text-align: center;
  letter-spacing: 0.02em;
}

.hero-banner {
  background: var(--f-surface, #fff);
  border-radius: 12px;
  padding: 48px 40px 56px;
  margin-bottom: 40px;
  position: relative;
  border: 1px solid var(--f-border, #e5e5e5);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
  animation: fadeUp 0.5s ease-out;
}

.hero-banner__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 380px);
  gap: clamp(32px, 5vw, 56px);
  align-items: center;
}

.hero-banner__content {
  position: relative;
  min-width: 0;
}

.hero-banner__aside {
  min-width: 0;
}

.hero-mosaic {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
  min-height: 220px;
  max-height: 320px;
}

.hero-mosaic__cell {
  position: relative;
  border-radius: 8px;
  border: 1px solid var(--f-border, #e5e5e5);
  background: #fafafa;
  overflow: hidden;
}

.hero-mosaic__cell--tall {
  grid-row: span 2;
}

.hero-mosaic__link {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.hero-mosaic__link:hover {
  border-color: #bdbdbd;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.hero-mosaic__link:focus-visible {
  outline: 2px solid #1a1a1a;
  outline-offset: 2px;
}

.hero-mosaic__img {
  width: 100%;
  height: 100%;
  display: block;
  transition: transform 0.45s ease;
}

.hero-mosaic__img :deep(.lazy-image__img) {
  object-fit: cover;
}

@media (prefers-reduced-motion: no-preference) {
  .hero-mosaic__link:hover .hero-mosaic__img {
    transform: scale(1.04);
  }
}

.hero-mosaic__cell--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.hero-mosaic__deco {
  width: 48%;
  max-width: 120px;
  aspect-ratio: 1;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 50%;
}

.hero-mosaic__deco--sm {
  width: 40%;
  max-width: 56px;
}

.hero-mosaic__cell--skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .hero-mosaic__cell--skeleton {
    animation: none;
  }
}

@media (max-width: 900px) {
  .hero-banner__grid {
    grid-template-columns: 1fr;
  }
  .hero-banner__aside {
    order: -1;
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
  }
  .hero-mosaic {
    max-height: 260px;
  }
}

.hero-banner__tag {
  display: inline-block;
  padding: 6px 12px 6px 10px;
  font-size: .6875rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--f-text-muted, #6b6b6b);
  background: #fafafa;
  border: 1px solid var(--f-border, #e5e5e5);
  border-left: 2px solid var(--f-brand, #e8532d);
  border-radius: 4px;
  margin-bottom: 24px;
}

.hero-banner__title {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  color: var(--f-text, #1a1a1a);
  line-height: 1.25;
  margin-bottom: 16px;
}

.hero-banner__sub {
  font-size: 0.9375rem;
  color: var(--f-text-muted, #6b6b6b);
  max-width: 420px;
  line-height: 1.75;
  margin-bottom: 32px;
  font-weight: 400;
}

.hero-banner__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.hero-banner__stats {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero-stat strong {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--f-text, #1a1a1a);
  font-variant-numeric: tabular-nums;
}

.hero-stat span {
  font-size: .6875rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--f-text-subtle, #9a9a9a);
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  font-size: .8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: background .2s, color .2s, border-color .2s, transform .15s ease, box-shadow .2s;
}

.hero-btn:active {
  transform: scale(0.98);
}

.hero-btn--primary {
  background: var(--f-brand, #e8532d);
  color: #fff;
  box-shadow: 0 2px 8px rgba(232, 83, 45, 0.25);
}

.hero-btn--primary:hover {
  background: var(--f-brand-hover, #c94522);
  box-shadow: 0 4px 16px rgba(232, 83, 45, 0.35);
  transform: translateY(-1px);
}

.hero-btn--outline {
  background: transparent;
  color: var(--f-text, #1a1a1a);
  border: 1px solid var(--f-border, #e5e5e5);
}

.hero-btn--outline:hover {
  border-color: #1a1a1a;
  background: #fafafa;
}

.hero-btn--lg {
  padding: 14px 36px;
  font-size: 0.875rem;
  border-radius: 8px;
}

.category-section {
  margin-top: -8px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 28px 16px;
  background: var(--f-surface, #fff);
  border-radius: 12px;
  text-decoration: none;
  border: 1px solid var(--f-border, #e5e5e5);
  box-shadow: none;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.25s ease;
}

.category-item:hover {
  border-color: #c9c9c9;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transform: translateY(-3px);
}

.category-item__icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: var(--f-text-muted, #6b6b6b);
  transition: background 0.2s, color 0.2s;
}

.category-item:hover .category-item__icon {
  background: var(--f-brand, #e8532d);
  color: #fff;
}

.category-item__icon-el {
  display: flex;
}

.category-item__name {
  font-size: .8125rem;
  font-weight: 500;
  color: var(--f-text, #1a1a1a);
  letter-spacing: 0.02em;
}

.flash-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--f-text, #1a1a1a);
  display: inline-block;
  opacity: 0.35;
}

.flash-tip {
  font-size: .75rem;
  color: var(--f-text-muted, #6b6b6b);
  font-weight: 400;
}

.flash-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.flash-scroll::-webkit-scrollbar {
  height: 4px;
}

.flash-scroll::-webkit-scrollbar-thumb {
  background: #e8e5e0;
  border-radius: 2px;
}

.flash-card {
  flex: 0 0 240px;
  background: var(--f-surface, #fff);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--f-border, #e5e5e5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  scroll-snap-align: start;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.25s ease;
  text-decoration: none;
  color: inherit;
  display: block;
  cursor: pointer;
}

.flash-card:hover {
  border-color: #e8532d;
  box-shadow: 0 8px 24px rgba(232, 83, 45, 0.12);
  transform: translateY(-4px);
}

.flash-card__img {
  position: relative;
  height: 180px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.flash-card__cover {
  width: 100%;
  height: 100%;
  display: block;
  transition: transform 0.45s ease;
}

.flash-card__cover :deep(.lazy-image__img) {
  object-fit: cover;
}

.flash-card:hover .flash-card__cover {
  transform: scale(1.04);
}

.flash-card__tag {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  padding: 4px 10px;
  font-size: .625rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--f-text, #1a1a1a);
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--f-border, #e5e5e5);
  border-radius: 4px;
}

.flash-card__discount {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  padding: 4px 10px;
  font-size: .75rem;
  font-weight: 700;
  color: #fff;
  background: #dc2626;
  border-radius: 4px;
}

.flash-card__body {
  padding: 14px;
}

.flash-card__name {
  font-size: .8125rem;
  font-weight: 500;
  color: var(--f-text, #1a1a1a);
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.flash-card__rating {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 8px;
}

.flash-card__star {
  color: #e5e5e5;
}

.flash-card__star.is-active {
  color: #f59e0b;
}

.flash-card__sales {
  margin-left: 6px;
  font-size: .6875rem;
  color: var(--f-text-subtle, #9a9a9a);
}

.flash-card__price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.flash-card__price {
  font-size: 1rem;
  font-weight: 600;
  color: var(--f-text, #1a1a1a);
  font-variant-numeric: tabular-nums;
}

.flash-card__original {
  font-size: .75rem;
  color: var(--f-text-subtle, #9a9a9a);
  text-decoration: line-through;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.product-card {
  background: var(--f-surface, #fff);
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  border: 1px solid var(--f-border, #e5e5e5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.25s ease;
  cursor: pointer;
}

.product-card:hover {
  border-color: #e8532d;
  box-shadow: 0 8px 24px rgba(232, 83, 45, 0.12);
  transform: translateY(-4px);
}

.product-card__img {
  position: relative;
  height: 200px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-card__cover {
  width: 100%;
  height: 100%;
  display: block;
  transition: transform 0.45s ease;
}

.product-card__cover :deep(.lazy-image__img) {
  object-fit: cover;
}

.product-card:hover .product-card__cover {
  transform: scale(1.04);
}

.product-card__actions {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.2s, transform 0.2s;
}

.product-card:hover .product-card__actions {
  opacity: 1;
  transform: translateY(0);
}

.product-card__action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(4px);
  color: var(--f-text-muted, #6b6b6b);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.15s;
}

.product-card__action-btn:hover {
  background: var(--f-brand, #e8532d);
  color: #fff;
}

.product-card__action-btn:active {
  transform: scale(0.95);
}

.product-card__body {
  padding: 14px;
}

.product-card__name {
  font-size: .8125rem;
  font-weight: 500;
  color: var(--f-text, #1a1a1a);
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__rating {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 8px;
}

.product-card__star {
  color: #e5e5e5;
}

.product-card__star.is-active {
  color: #f59e0b;
}

.product-card__sales {
  margin-left: 6px;
  font-size: .6875rem;
  color: var(--f-text-subtle, #9a9a9a);
}

.product-card__bottom {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.product-card__price {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--f-text, #1a1a1a);
  font-variant-numeric: tabular-nums;
}

.product-card__original {
  font-size: .75rem;
  color: var(--f-text-subtle, #9a9a9a);
  text-decoration: line-through;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.shop-card {
  background: var(--f-surface, #fff);
  border-radius: 12px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  border: 1px solid var(--f-border, #e5e5e5);
  box-shadow: none;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.25s ease;
}

.shop-card:hover {
  border-color: #c9c9c9;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.shop-card__avatar {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--f-text-muted, #6b6b6b);
}

.shop-card__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.shop-card__name {
  font-size: .875rem;
  font-weight: 600;
  color: var(--f-text, #1a1a1a);
}

.shop-card__desc {
  font-size: .75rem;
  color: var(--f-text-muted, #6b6b6b);
  line-height: 1.6;
}

.shop-card__meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 4px;
}

.shop-card__credit {
  font-size: .6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--f-text, #1a1a1a);
  background: #fafafa;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid var(--f-border, #e5e5e5);
}

.shop-card__count {
  font-size: .6875rem;
  color: var(--f-text-subtle, #9a9a9a);
}

.shop-card__highlight {
  margin: 6px 0 0;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.5;
  color: var(--f-text-muted, #6b6b6b);
}

.shop-card__enter {
  margin-top: 8px;
  padding: 8px 20px;
  font-size: .75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--f-text, #1a1a1a);
  background: transparent;
  border: 1px solid var(--f-border, #e5e5e5);
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: border-color .2s, background .2s, transform .15s;
}

.shop-card__enter:hover {
  background: #fafafa;
  border-color: #1a1a1a;
}

.shop-card__enter:active {
  transform: scale(0.98);
}

.advantage-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.advantage-card {
  background: var(--f-surface, #fff);
  border-radius: 12px;
  padding: 32px 20px;
  text-align: center;
  border: 1px solid var(--f-border, #e5e5e5);
  box-shadow: none;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.25s ease;
}

.advantage-card:hover {
  border-color: #c9c9c9;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.advantage-card__icon {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  color: var(--f-text-muted, #6b6b6b);
}

.advantage-card__title {
  font-size: .8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--f-text, #1a1a1a);
  margin-bottom: 10px;
}

.advantage-card__desc {
  font-size: .75rem;
  color: var(--f-text-muted, #6b6b6b);
  line-height: 1.65;
}

.cta-section {
  text-align: center;
  padding: 72px 24px;
  margin-bottom: 8px;
  background: var(--f-surface, #fff);
  border-radius: 12px;
  border: 1px solid var(--f-border, #e5e5e5);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
  animation: fadeUp 0.5s ease-out 0.2s both;
}

.cta-section__lead {
  margin: 0 auto 10px;
  max-width: 28rem;
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.55;
  color: var(--f-text-muted, #6b6b6b);
}

.cta-section__title {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--f-text, #1a1a1a);
  margin-bottom: 12px;
}

.cta-section__desc {
  font-size: .875rem;
  color: var(--f-text-muted, #6b6b6b);
  margin-bottom: 28px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.65;
}

@media (max-width: 860px) {
  .hero-banner {
    padding: 40px 24px;
    border-radius: 12px;
  }
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .shop-grid {
    grid-template-columns: 1fr;
  }
  .advantage-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .hero-banner__stats {
    gap: 16px;
  }
  .product-grid {
    grid-template-columns: 1fr;
  }
  .advantage-grid {
    grid-template-columns: 1fr;
  }
  .flash-card {
    flex: 0 0 200px;
  }
}
</style>
