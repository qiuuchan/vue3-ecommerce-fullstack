<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ShoppingCart, Location, ArrowRight } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useCartStore } from '@/stores/cartStore';
import { useAppI18n } from '@/composables/useAppI18n';
import { formatCurrency } from '@/utils/formatLocale';
import { fetchAddresses } from '@/api/address';
import { createOrderApi } from '@/api/order';
import type { Address } from '@/types/order';
import PaymentModal from '@/components/PaymentModal.vue';

const router = useRouter();
const { t, locale } = useAppI18n();
const cartStore = useCartStore();

const addresses = ref<Address[]>([]);
const selectedAddressId = ref<number | null>(null);
const loading = ref(true);
const submitting = ref(false);
const paymentVisible = ref(false);
const createdOrderId = ref<string>('');

const goodsTotal = computed(() => cartStore.totalPrice);
const shippingFee = computed(() => (goodsTotal.value >= 99 ? 0 : 10));
const payableAmount = computed(() => goodsTotal.value + shippingFee.value);

const loadData = async (): Promise<void> => {
  loading.value = true;
  try {
    if (cartStore.cartList.length === 0) {
      await cartStore.loadCart();
    }
    addresses.value = await fetchAddresses();
    const defaultAddr = addresses.value.find((a) => a.isDefault);
    if (defaultAddr) {
      selectedAddressId.value = defaultAddr.id;
    } else if (addresses.value.length > 0) {
      selectedAddressId.value = addresses.value[0].id;
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('common.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async (): Promise<void> => {
  if (cartStore.cartList.length === 0) {
    ElMessage.warning(t('checkout.emptyCart'));
    return;
  }
  if (!selectedAddressId.value) {
    ElMessage.warning(t('checkout.noAddress'));
    return;
  }
  submitting.value = true;
  try {
    const result = await createOrderApi({
      addressId: selectedAddressId.value,
      items: cartStore.cartList.map((item) => ({
        productId: item.productId,
        count: item.count
      }))
    });
    // 保存订单号，显示支付弹窗
    createdOrderId.value = String(result.orderId);
    paymentVisible.value = true;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('checkout.submitFail'));
  } finally {
    submitting.value = false;
  }
};

// 支付成功回调
const handlePaymentSuccess = async (): Promise<void> => {
  ElMessage.success(t('payment.success'));
  await router.push(`/order-success/${createdOrderId.value}`);
};

onMounted(() => {
  void loadData();
});
</script>

<template>
  <div class="checkout-page">
    <h1 class="checkout-title">{{ t('checkout.title') }}</h1>

    <div v-if="loading" class="checkout-state">{{ t('common.loading') }}</div>
    <template v-else>
      <!-- 地址选择 -->
      <section class="checkout-section">
        <h2 class="checkout-section__title">
          <el-icon><Location /></el-icon>
          {{ t('checkout.addressTitle') }}
        </h2>
        <div v-if="addresses.length === 0" class="checkout-empty">
          <p>{{ t('checkout.noAddressHint') }}</p>
          <router-link to="/user/addresses" class="ui-btn ui-btn--primary ui-btn--sm">
            {{ t('checkout.goAddAddress') }}
          </router-link>
        </div>
        <div v-else class="addr-options">
          <label
            v-for="addr in addresses"
            :key="addr.id"
            class="addr-option"
            :class="{ 'addr-option--active': selectedAddressId === addr.id }"
          >
            <input v-model="selectedAddressId" type="radio" :value="addr.id" class="addr-radio">
            <div class="addr-option__info">
              <div class="addr-option__row">
                <span class="addr-option__name">{{ addr.recipient }}</span>
                <span class="addr-option__phone">{{ addr.phone }}</span>
                <span v-if="addr.isDefault" class="addr-option__badge">{{ t('address.default') }}</span>
              </div>
              <p class="addr-option__detail">
                {{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}
              </p>
            </div>
          </label>
          <router-link to="/user/addresses" class="addr-manage-link">
            {{ t('checkout.manageAddress') }} <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
      </section>

      <!-- 商品清单 -->
      <section class="checkout-section">
        <h2 class="checkout-section__title">
          <el-icon><ShoppingCart /></el-icon>
          {{ t('checkout.goodsTitle') }}
        </h2>
        <ul class="checkout-goods">
          <li v-for="item in cartStore.cartList" :key="item.id" class="checkout-goods__item">
            <span class="checkout-goods__name">{{ item.name }}</span>
            <span class="checkout-goods__meta">{{ formatCurrency(item.price, locale) }} × {{ item.count }}</span>
            <span class="checkout-goods__sub">{{ formatCurrency((item.price * item.count), locale) }}</span>
          </li>
        </ul>
      </section>

      <!-- 金额汇总 -->
      <section class="checkout-section checkout-summary">
        <div class="summary-row">
          <span>{{ t('checkout.goodsTotal') }}</span>
          <span>{{ formatCurrency(goodsTotal, locale) }}</span>
        </div>
        <div class="summary-row">
          <span>{{ t('checkout.shippingFee') }}</span>
          <span>{{ shippingFee === 0 ? t('checkout.freeShipping') : formatCurrency(shippingFee, locale) }}</span>
        </div>
        <div class="summary-row summary-row--total">
          <span>{{ t('checkout.payable') }}</span>
          <span class="summary-total">{{ formatCurrency(payableAmount, locale) }}</span>
        </div>
      </section>

      <!-- 提交 -->
      <div class="checkout-actions">
        <router-link to="/cart" class="ui-btn ui-btn--ghost">{{ t('checkout.backCart') }}</router-link>
        <button
          type="button"
          class="ui-btn ui-btn--primary ui-btn--lg"
          :disabled="submitting || !selectedAddressId"
          @click="handleSubmit"
        >
          {{ submitting ? t('checkout.submitting') : t('checkout.submit') }} →
        </button>
      </div>
    </template>

    <!-- 支付弹窗 -->
    <PaymentModal
      v-model:visible="paymentVisible"
      :amount="payableAmount"
      :order-id="createdOrderId"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<style scoped>
.checkout-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.checkout-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 24px;
}

.checkout-state {
  text-align: center;
  padding: 40px 0;
  color: #6b6b6b;
}

.checkout-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
}

.checkout-section__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.checkout-empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  color: #6b6b6b;
}

.addr-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.addr-option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color .2s, background .2s;
}

.addr-option:hover,
.addr-option--active {
  border-color: #e8532d;
  background: #f8fafc;
}

.addr-radio {
  margin-top: 4px;
  accent-color: #e8532d;
}

.addr-option__info {
  flex: 1;
}

.addr-option__row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.addr-option__name {
  font-weight: 600;
  color: #1a1a1a;
}

.addr-option__phone {
  font-size: .875rem;
  color: #6b6b6b;
}

.addr-option__badge {
  padding: 2px 8px;
  font-size: .75rem;
  color: #fff;
  background: #e8532d;
  border-radius: 4px;
}

.addr-option__detail {
  margin: 0;
  font-size: .875rem;
  color: #4b4b4b;
}

.addr-manage-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: .875rem;
  color: #e8532d;
  text-decoration: none;
}

.addr-manage-link:hover {
  text-decoration: underline;
}

.checkout-goods {
  list-style: none;
  padding: 0;
  margin: 0;
}

.checkout-goods__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.checkout-goods__item:last-child {
  border-bottom: none;
}

.checkout-goods__name {
  flex: 1;
  color: #1a1a1a;
}

.checkout-goods__meta {
  color: #6b6b6b;
  font-size: .875rem;
  white-space: nowrap;
}

.checkout-goods__sub {
  min-width: 80px;
  text-align: right;
  font-weight: 600;
  color: #1a1a1a;
}

.checkout-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: .9375rem;
  color: #4b4b4b;
}

.summary-row--total {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #e5e5e5;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
}

.summary-total {
  font-size: 1.5rem;
  color: #b91c1c;
}

.checkout-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
</style>
