<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { List, Box } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { fetchUserOrders, cancelOrderApi } from '@/api/order';
import type { UserOrder, OrderStatus } from '@/types/order';
import { useAppI18n } from '@/composables/useAppI18n';
import { formatCurrency } from '@/utils/formatLocale';

const router = useRouter();
const { t, locale } = useAppI18n();

const orders = ref<UserOrder[]>([]);
const loading = ref(true);
const currentStatus = ref<OrderStatus | 'all'>('all');

const statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: t('order.status.all') },
  { value: 'pending_payment', label: t('admin.order.status.pending_payment') },
  { value: 'pending_shipping', label: t('admin.order.status.pending_shipping') },
  { value: 'shipped', label: t('admin.order.status.shipped') },
  { value: 'completed', label: t('admin.order.status.completed') },
  { value: 'cancelled', label: t('admin.order.status.cancelled') }
];

const filteredOrders = computed(() => {
  if (currentStatus.value === 'all') return orders.value;
  return orders.value.filter((o) => o.status === currentStatus.value);
});

const loadOrders = async (): Promise<void> => {
  loading.value = true;
  try {
    orders.value = await fetchUserOrders();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('common.loadFailed'));
  } finally {
    loading.value = false;
  }
};

const handleCancel = async (order: UserOrder): Promise<void> => {
  try {
    await cancelOrderApi(order.id);
    ElMessage.success(t('order.cancelSuccess'));
    await loadOrders();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('order.cancelFail'));
  }
};

const statusClass = (status: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    pending_payment: 'status--warning',
    pending_shipping: 'status--info',
    shipped: 'status--info',
    completed: 'status--success',
    cancelled: 'status--danger'
  };
  return map[status];
};

onMounted(() => {
  void loadOrders();
});
</script>

<template>
  <div class="orders-page">
    <header class="orders-head">
      <h1 class="orders-title">
        <el-icon><List /></el-icon>
        {{ t('order.listTitle') }}
      </h1>
    </header>

    <div class="orders-filter">
      <button
        v-for="opt in statusOptions"
        :key="opt.value"
        type="button"
        class="filter-btn"
        :class="{ 'filter-btn--active': currentStatus === opt.value }"
        @click="currentStatus = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>

    <div v-if="loading" class="orders-state">{{ t('common.loading') }}</div>
    <div v-else-if="filteredOrders.length === 0" class="orders-empty">
      <el-icon :size="40"><Box /></el-icon>
      <p>{{ t('order.empty') }}</p>
    </div>
    <div v-else class="orders-list">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-card"
        @click="router.push(`/user/orders/${order.id}`)"
      >
        <div class="order-card__header">
          <span class="order-card__no">{{ order.orderNo }}</span>
          <span class="order-card__status" :class="statusClass(order.status)">
            {{ t(`admin.order.status.${order.status}`) }}
          </span>
        </div>
        <div class="order-card__items">
          <div v-for="(item, idx) in order.items.slice(0, 3)" :key="idx" class="order-item">
            <span class="order-item__name">{{ item.name }}</span>
            <span class="order-item__count">×{{ item.count }}</span>
          </div>
          <p v-if="order.items.length > 3" class="order-more">
            {{ t('order.moreItems', { n: order.items.length - 3 }) }}
          </p>
        </div>
        <div class="order-card__footer">
          <span class="order-card__time">{{ order.createdAt }}</span>
          <span class="order-card__total">
            {{ t('order.total') }} <strong>{{ formatCurrency(order.totalAmount, locale) }}</strong>
          </span>
        </div>
        <div v-if="order.status === 'pending_payment'" class="order-card__actions" @click.stop>
          <button type="button" class="ui-btn ui-btn--ghost ui-btn--sm" @click="handleCancel(order)">
            {{ t('order.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.orders-head {
  margin-bottom: 20px;
}

.orders-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.orders-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-btn {
  padding: 6px 14px;
  font-size: .875rem;
  color: #6b6b6b;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  cursor: pointer;
  transition: all .2s;
}

.filter-btn:hover {
  border-color: #e8532d;
  color: #e8532d;
}

.filter-btn--active {
  background: #e8532d;
  color: #fff;
  border-color: #e8532d;
}

.orders-state {
  text-align: center;
  padding: 40px 0;
  color: #6b6b6b;
}

.orders-empty {
  text-align: center;
  padding: 60px 0;
  color: #9a9a9a;
}

.orders-empty p {
  margin-top: 12px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card {
  padding: 16px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
}

.order-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.order-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.order-card__no {
  font-size: .875rem;
  color: #6b6b6b;
  font-family: monospace;
}

.order-card__status {
  padding: 2px 10px;
  font-size: .75rem;
  border-radius: 4px;
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

.order-card__items {
  margin-bottom: 12px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: .875rem;
  color: #4b4b4b;
  border-bottom: 1px dashed #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item__name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-item__count {
  color: #9a9a9a;
}

.order-more {
  margin: 4px 0 0;
  font-size: .8125rem;
  color: #9a9a9a;
}

.order-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.order-card__time {
  font-size: .8125rem;
  color: #9a9a9a;
}

.order-card__total {
  font-size: .875rem;
  color: #4b4b4b;
}

.order-card__total strong {
  font-size: 1rem;
  color: #b91c1c;
}

.order-card__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
