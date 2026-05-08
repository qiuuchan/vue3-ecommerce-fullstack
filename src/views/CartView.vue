<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { usePageVisibility } from '@/composables/usePageVisibility';
import { useRouter } from 'vue-router';
import { ShoppingCart } from '@element-plus/icons-vue';
import { useCartStore } from '@/stores/cartStore';
import { useAppI18n } from '@/composables/useAppI18n';
import { formatCurrency } from '@/utils/formatLocale';

const router = useRouter();
const { t, locale } = useAppI18n();
const cartStore = useCartStore();

const goCheckout = (): void => {
  if (cartStore.cartList.length === 0) return;
  void router.push('/checkout');
};

onMounted(() => { void cartStore.loadCart(); });
usePageVisibility(() => { void cartStore.loadCart(); });

const totalCount = computed(() =>
  cartStore.cartList.reduce((s, i) => s + i.count, 0)
);
</script>

<template>
  <div class="cart-page">
    <!-- 页头 -->
    <div class="cart-header">
      <div>
        <h1 class="cart-title">{{ t('cart.title') }}</h1>
        <p class="cart-sub">
          {{ t('cart.sub') }} <b>{{ totalCount }}</b> {{ t('cart.items') }}
        </p>
      </div>
      <router-link to="/products" class="ui-btn ui-btn--ghost ui-btn--sm">
        {{ t('cart.continue') }}
      </router-link>
    </div>

    <!-- 空 -->
    <div v-if="cartStore.cartList.length === 0" class="ui-empty">
      <span class="ui-empty__icon" aria-hidden="true"><el-icon :size="40"><ShoppingCart /></el-icon></span>
      <p>{{ t('cart.empty') }}</p>
      <router-link to="/products" class="ui-btn ui-btn--primary" style="margin-top:20px">
        {{ t('cart.goShop') }}
      </router-link>
    </div>

    <!-- 购物车内容 -->
    <template v-else>
      <ul class="ui-cart-list">
        <li
          v-for="(item, idx) in cartStore.cartList"
          :key="item.id"
          class="ui-cart-item"
        >
          <!-- 序号 -->
          <span class="cart-item-index">{{ idx + 1 }}</span>

          <!-- 商品信息 -->
          <div class="cart-item-info">
            <span class="ui-cart-item__name">{{ item.name }}</span>
            <span class="cart-item-id">ID: {{ item.productId }}</span>
          </div>

          <!-- 单价 -->
          <div class="cart-item-cell">
            <span class="cart-item-cell__label">{{ t('cart.unitPrice') }}</span>
            <span class="ui-price">{{ formatCurrency(item.price, locale) }}</span>
          </div>

          <!-- 数量 -->
          <div class="cart-item-cell">
            <span class="cart-item-cell__label">{{ t('cart.qty') }}</span>
            <span class="cart-item-qty">× {{ item.count }}</span>
          </div>

          <!-- 小计 -->
          <div class="cart-item-cell cart-item-subtotal">
            <span class="cart-item-cell__label">{{ t('cart.subtotal') }}</span>
            <span class="ui-price">{{ formatCurrency((item.price * item.count), locale) }}</span>
          </div>
        </li>
      </ul>

      <!-- 结算区 -->
      <div class="cart-checkout">
        <div class="cart-checkout__info">
          <span class="cart-checkout__label">{{ t('cart.sub') }} {{ totalCount }} {{ t('cart.totalItems') }}</span>
          <div class="cart-checkout__price-row">
            <span class="cart-checkout__total-label">{{ t('cart.total') }}</span>
            <span class="cart-checkout__total">
              ¥ {{ cartStore.totalPrice.toFixed(2) }}
            </span>
          </div>
        </div>
        <button type="button" class="ui-btn ui-btn--primary ui-btn--lg checkout-btn" @click="goCheckout">
          {{ t('cart.checkout') }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.cart-page { max-width: 860px; margin: 0 auto; }

/* 页头 */
.cart-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 32px;
}

.cart-title {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--f-text, #1a1a1a);
  margin-bottom: 6px;
}

.cart-sub {
  font-size: .875rem;
  color: var(--f-text-muted, #6b6b6b);
}

/* 购物车行 */
.cart-item-index {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: #fafafa;
  border: 1px solid var(--f-border, #e5e5e5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .75rem;
  font-weight: 600;
  color: var(--f-text-muted, #6b6b6b);
  flex-shrink: 0;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cart-item-id {
  font-size: .75rem;
  color: var(--f-text-subtle, #9a9a9a);
}

.cart-item-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  min-width: 80px;
}

.cart-item-cell__label {
  font-size: .7rem;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--f-text-subtle, #9a9a9a);
}

.cart-item-qty {
  font-size: 1rem;
  font-weight: 600;
  color: var(--f-text, #1a1a1a);
}

.cart-item-subtotal .ui-price {
  font-size: 1.15rem;
}

/* 结算区 */
.cart-checkout {
  margin-top: 32px;
  padding: 28px 24px;
  background: var(--f-surface, #fff);
  border: 1px solid var(--f-border, #e5e5e5);
  border-radius: var(--f-radius, 6px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.cart-checkout__info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cart-checkout__label {
  font-size: .875rem;
  color: var(--f-text-muted, #6b6b6b);
}

.cart-checkout__price-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.cart-checkout__total-label {
  font-size: 1rem;
  color: var(--f-text-muted, #6b6b6b);
}

.cart-checkout__total {
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--f-text, #1a1a1a);
}

.checkout-btn {
  min-width: 160px;
}
</style>
