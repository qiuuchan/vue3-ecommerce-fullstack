<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchOrderList, updateOrderStatusApi } from '@/api/order';
import type { OrderRecord, OrderStatus } from '@/types/order';
import { useAppI18n } from '@/composables/useAppI18n';
import { formatCurrency } from '@/utils/formatLocale';
import { toastError } from '@/utils/toast';

const { t, locale } = useAppI18n();
const router = useRouter();
const orders = ref<OrderRecord[]>([]);
const loading = ref(true);
const filters = reactive({
  keyword: '',
  status: ''
});

// 状态文案随语言切换重算
const statusTextMap = computed(() => ({
  pending_payment: t('admin.order.status.pending_payment'),
  pending_shipping: t('admin.order.status.pending_shipping'),
  shipped: t('admin.order.status.shipped'),
  completed: t('admin.order.status.completed'),
  cancelled: t('admin.order.status.cancelled')
}));

const statusClassMap: Record<OrderStatus, string> = {
  pending_payment: 'admin-chip--warning',
  pending_shipping: 'admin-chip--info',
  shipped: 'admin-chip--info',
  completed: 'admin-chip--success',
  cancelled: 'admin-chip--danger'
};

type OrderAction = { labelKey: string; status: OrderStatus };

// 下一动作按钮：labelKey 交给模板里 t()
const nextActionMap = computed<Record<OrderStatus, OrderAction[]>>(() => ({
  pending_payment: [
    { labelKey: 'admin.order.action.markPaid', status: 'pending_shipping' },
    { labelKey: 'admin.order.action.cancel', status: 'cancelled' }
  ],
  pending_shipping: [
    { labelKey: 'admin.order.action.ship', status: 'shipped' },
    { labelKey: 'admin.order.action.cancel', status: 'cancelled' }
  ],
  shipped: [{ labelKey: 'admin.order.action.complete', status: 'completed' }],
  completed: [],
  cancelled: []
}));

const loadOrders = async (): Promise<void> => {
  loading.value = true;
  try {
    orders.value = await fetchOrderList({
      keyword: filters.keyword || undefined,
      status: filters.status ? (filters.status as OrderStatus) : undefined
    });
  } finally {
    loading.value = false;
  }
};

const onKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Enter') void loadOrders();
};

const handleAction = async (order: OrderRecord, nextStatus: OrderStatus): Promise<void> => {
  const label = statusTextMap.value[nextStatus] || nextStatus;
  const ok = window.confirm(t('admin.order.confirmUpdate', { orderNo: order.orderNo, label }));
  if (!ok) return;
  try {
    await updateOrderStatusApi(order.id, nextStatus);
    await loadOrders();
  } catch (error) {
    toastError(error instanceof Error ? error.message : t('admin.product.opFail'));
  }
};

onMounted(() => {
  void loadOrders();
});
</script>

<template>
  <div class="admin-page">
    <section class="admin-toolbar anim-fade-up">
      <div>
        <h2 class="admin-toolbar__title">{{ t('admin.order.title') }}</h2>
        <p class="admin-toolbar__sub">{{ t('admin.order.sub') }}</p>
      </div>
    </section>

    <section class="admin-panel anim-fade-up anim-delay-1">
      <div class="admin-filters">
        <input
          v-model="filters.keyword"
          class="admin-input"
          :placeholder="t('admin.order.searchPh')"
          @keydown="onKeydown"
        />
        <select v-model="filters.status" class="admin-select">
          <option value="">{{ t('admin.product.allStatus') }}</option>
          <option value="pending_payment">{{ t('admin.order.status.pending_payment') }}</option>
          <option value="pending_shipping">{{ t('admin.order.status.pending_shipping') }}</option>
          <option value="shipped">{{ t('admin.order.status.shipped') }}</option>
          <option value="completed">{{ t('admin.order.status.completed') }}</option>
          <option value="cancelled">{{ t('admin.order.status.cancelled') }}</option>
        </select>
      </div>
      <div class="admin-actions" style="margin-top: 14px;">
        <button type="button" class="ui-btn ui-btn--primary ui-btn--sm" @click="loadOrders">{{ t('admin.btn.query') }}</button>
        <button
          type="button"
          class="ui-btn ui-btn--ghost ui-btn--sm"
          @click="() => { filters.keyword = ''; filters.status = ''; void loadOrders(); }"
        >
          {{ t('admin.btn.reset') }}
        </button>
      </div>
    </section>

    <section class="admin-panel anim-fade-up anim-delay-2">
      <div v-if="loading" class="admin-empty">{{ t('admin.order.loading') }}</div>
      <div v-else-if="orders.length === 0" class="admin-empty">{{ t('admin.order.empty') }}</div>

      <div v-else class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>{{ t('admin.order.col.no') }}</th>
              <th>{{ t('admin.order.col.user') }}</th>
              <th>{{ t('admin.order.col.amount') }}</th>
              <th>{{ t('admin.order.col.status') }}</th>
              <th>{{ t('admin.order.col.created') }}</th>
              <th>{{ t('admin.order.col.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in orders" :key="item.id">
              <td class="td-mono">{{ item.orderNo }}</td>
              <td>{{ item.userName }}</td>
              <td>
                <span class="td-amount">{{ formatCurrency(item.totalAmount, locale) }}</span>
              </td>
              <td>
                <span class="admin-chip" :class="statusClassMap[item.status]">
                  {{ statusTextMap[item.status] }}
                </span>
              </td>
              <td class="td-date">{{ item.createdAt }}</td>
              <td>
                <div class="admin-actions row-actions">
                  <button
                    type="button"
                    class="ui-btn ui-btn--ghost ui-btn--sm"
                    @click="router.push(`/admin/order/detail/${item.id}`)"
                  >
                    {{ t('admin.order.viewDetail') }}
                  </button>
                  <!-- 根据当前状态动态渲染可操作按钮 -->
                  <button
                    v-for="action in nextActionMap[item.status] || []"
                    :key="action.status"
                    type="button"
                    class="ui-btn ui-btn--ghost ui-btn--sm"
                    :class="action.status === 'cancelled' ? 'btn-cancel' : 'btn-forward'"
                    @click="handleAction(item, action.status)"
                  >
                    {{ t(action.labelKey) }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.td-mono {
  font-family: monospace;
  font-size: 12px;
  color: var(--admin-text-muted, #6b6b6b);
}

.td-amount {
  font-weight: 600;
  color: var(--admin-text, #1a1a1a);
}

.td-date {
  font-size: 12px;
  color: var(--admin-text-subtle, #9a9a9a);
}

.row-actions {
  flex-wrap: wrap;
  gap: 6px;
}

.btn-forward { color: #34d399; border-color: rgba(16, 185, 129, 0.3); }
.btn-forward:hover { background: rgba(16, 185, 129, 0.12); }
.btn-cancel { color: #f87171; border-color: rgba(244, 63, 94, 0.3); }
.btn-cancel:hover { background: rgba(244, 63, 94, 0.1); }
</style>
