<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { fetchUserOrderDetail, cancelOrderApi } from '@/api/order';
import type { UserOrder } from '@/types/order';
import { useAppI18n } from '@/composables/useAppI18n';
import { formatCurrency } from '@/utils/formatLocale';

const route = useRoute();
const router = useRouter();
const { t, locale } = useAppI18n();

const order = ref<UserOrder | null>(null);
const loading = ref(true);
const refunding = ref(false);

const loadOrder = async (): Promise<void> => {
  const id = Number(route.params.id);
  if (!id) {
    await router.replace('/user/orders');
    return;
  }
  loading.value = true;
  try {
    order.value = await fetchUserOrderDetail(id);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('common.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const handleCancel = async (): Promise<void> => {
  if (!order.value) return;
  try {
    await cancelOrderApi(order.value.id);
    ElMessage.success(t('order.cancelSuccess'));
    await loadOrder();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('order.cancelFail'));
  }
};

const handleRefund = async (): Promise<void> => {
  if (!order.value) return;
  refunding.value = true;
  try {
    await ElMessageBox.confirm(
      t('refund.confirmDesc'),
      t('refund.confirmTitle'),
      { confirmButtonText: t('refund.confirmBtn'), cancelButtonText: t('common.back'), type: 'warning' }
    );
    await new Promise(r => setTimeout(r, 1500));
    (order.value as any).status = 'refunding';
    ElMessage.success(t('refund.success'));
  } catch {
    // cancelled
  } finally {
    refunding.value = false;
  }
};

const canRefund = computed(() => {
  const s = (order.value as any)?.status;
  return s === 'shipped' || s === 'completed';
});

const canCancel = computed(() => (order.value as any)?.status === 'pending_payment');

const statusClass = (status: string): string => {
  const map: Record<string, string> = {
    pending_payment: 'status--warning',
    pending_shipping: 'status--info',
    shipped: 'status--info',
    completed: 'status--success',
    cancelled: 'status--danger'
  };
  return map[status] || '';
};

onMounted(() => {
  void loadOrder();
});
</script>

<template>
  <div class="odetail-page">
    <header class="odetail-head">
      <button type="button" class="odetail-back" @click="router.back()">← {{ t('order.back') }}</button>
      <h1 class="odetail-title">{{ t('order.detailTitle') }}</h1>
    </header>

    <div v-if="loading" class="odetail-state">{{ t('common.loading') }}</div>
    <div v-else-if="!order" class="odetail-state">{{ t('order.notFound') }}</div>
    <template v-else>
      <!-- 状态 -->
      <section class="odetail-section">
        <div class="odetail-status" :class="statusClass(order.status)">
          {{ t(`admin.order.status.${order.status}`) }}
        </div>
        <p class="odetail-no">{{ t('order.orderNo') }} {{ order.orderNo }}</p>
        <p class="odetail-time">{{ t('order.createdAt') }} {{ order.createdAt }}</p>
      </section>

      <!-- 商品 -->
      <section class="odetail-section">
        <h2 class="odetail-section__title">{{ t('order.itemsTitle') }}</h2>
        <ul class="odetail-items">
          <li v-for="item in order.items" :key="item.productId" class="odetail-item">
            <span class="odetail-item__name">{{ item.name }}</span>
            <span class="odetail-item__meta">{{ formatCurrency(item.price, locale) }} × {{ item.count }}</span>
            <span class="odetail-item__sub">{{ formatCurrency((item.price * item.count), locale) }}</span>
          </li>
        </ul>
      </section>

      <!-- 地址 -->
      <section class="odetail-section">
        <h2 class="odetail-section__title">{{ t('order.addressTitle') }}</h2>
        <div class="odetail-address">
          <p><strong>{{ order.address.recipient }}</strong> {{ order.address.phone }}</p>
          <p>{{ order.address.province }} {{ order.address.city }} {{ order.address.district }} {{ order.address.detail }}</p>
        </div>
      </section>

      <!-- 金额 -->
      <section class="odetail-section">
        <div class="odetail-summary">
          <div class="summary-line">
            <span>{{ t('order.goodsTotal') }}</span>
            <span>{{ formatCurrency(order.totalAmount, locale) }}</span>
          </div>
          <div class="summary-line">
            <span>{{ t('order.shippingFee') }}</span>
            <span>¥0.00</span>
          </div>
          <div class="summary-line summary-line--total">
            <span>{{ t('order.payable') }}</span>
            <span>{{ formatCurrency(order.totalAmount, locale) }}</span>
          </div>
        </div>
      </section>

      <!-- 操作 -->
      <div v-if="canCancel || canRefund" class="odetail-actions">
        <button v-if="canCancel" type="button" class="ui-btn ui-btn--ghost" @click="handleCancel">
          {{ t('order.cancel') }}
        </button>
        <button v-if="canRefund" type="button" class="ui-btn ui-btn--danger" :disabled="refunding" @click="handleRefund">
          {{ refunding ? t('refund.processing') : t('refund.requestBtn') }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.odetail-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.odetail-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.odetail-back {
  padding: 6px 12px;
  font-size: .875rem;
  color: #e8532d;
  background: transparent;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  cursor: pointer;
  transition: all .2s;
}

.odetail-back:hover {
  background: #f5f5f5;
}

.odetail-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.odetail-state {
  text-align: center;
  padding: 40px 0;
  color: #6b6b6b;
}

.odetail-section {
  margin-bottom: 16px;
  padding: 16px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
}

.odetail-status {
  display: inline-block;
  padding: 4px 12px;
  font-size: .875rem;
  font-weight: 600;
  border-radius: 4px;
  margin-bottom: 10px;
}

.status--warning {
  background: #fef3c7;
  color: #92400e;
}

.status--info {
  background: #dbeafe;
  color: #1e40af;
}

.status--success {
  background: #d1fae5;
  color: #065f46;
}

.status--danger {
  background: #fee2e2;
  color: #991b1b;
}

.odetail-no,
.odetail-time {
  margin: 4px 0;
  font-size: .875rem;
  color: #6b6b6b;
}

.odetail-section__title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.odetail-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.odetail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.odetail-item:last-child {
  border-bottom: none;
}

.odetail-item__name {
  flex: 1;
  color: #1a1a1a;
}

.odetail-item__meta {
  color: #6b6b6b;
  font-size: .875rem;
  white-space: nowrap;
}

.odetail-item__sub {
  min-width: 80px;
  text-align: right;
  font-weight: 600;
  color: #1a1a1a;
}

.odetail-address {
  font-size: .9375rem;
  color: #4b4b4b;
  line-height: 1.6;
}

.odetail-address p {
  margin: 4px 0;
}

.odetail-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  font-size: .9375rem;
  color: #4b4b4b;
}

.summary-line--total {
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid #e5e5e5;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a1a;
}

.odetail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
