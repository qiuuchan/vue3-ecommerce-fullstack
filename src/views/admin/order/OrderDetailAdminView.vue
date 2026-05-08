<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { fetchOrderDetail } from '@/api/order';
import type { OrderRecord } from '@/types/order';
import { useAppI18n } from '@/composables/useAppI18n';
import { formatCurrency, formatDateTime, type AppLocaleTag } from '@/utils/formatLocale';

const { t, locale } = useAppI18n();
const route = useRoute();
const order = ref<OrderRecord | null>(null);

const priceLocale = computed((): AppLocaleTag => (locale.value === 'en-US' ? 'en-US' : 'zh-CN'));
const createdAtDisplay = computed(() =>
  order.value?.createdAt ? formatDateTime(order.value.createdAt, priceLocale.value) : '--'
);
const totalDisplay = computed(() =>
  order.value ? formatCurrency(order.value.totalAmount, priceLocale.value) : ''
);

/** 订单状态码转当前语言（未知则原样显示） */
const orderStatusLabel = (code: string): string => {
  const key = `admin.order.status.${code}`;
  const text = t(key);
  return text === key ? code : text;
};

onMounted(async () => {
  order.value = await fetchOrderDetail(Number(route.params.id));
});
</script>

<template>
  <div class="admin-page">
    <section v-if="order" class="admin-grid-2">
      <article class="admin-panel">
        <h3 class="admin-panel__title">{{ t('admin.odetail.baseTitle') }}</h3>
        <div class="detail-grid">
          <div><span>{{ t('admin.odetail.orderNo') }}</span><strong>{{ order.orderNo }}</strong></div>
          <div><span>{{ t('admin.odetail.user') }}</span><strong>{{ order.userName }}</strong></div>
          <div><span>{{ t('admin.odetail.created') }}</span><strong>{{ createdAtDisplay }}</strong></div>
          <div><span>{{ t('admin.odetail.payTime') }}</span><strong>{{ order.payTime || '--' }}</strong></div>
          <div><span>{{ t('admin.odetail.address') }}</span><strong>{{ order.address }}</strong></div>
          <div><span>{{ t('admin.odetail.phone') }}</span><strong>{{ order.phone }}</strong></div>
          <div><span>{{ t('admin.odetail.status') }}</span><strong>{{ orderStatusLabel(order.status) }}</strong></div>
          <div><span>{{ t('admin.odetail.total') }}</span><strong>{{ totalDisplay }}</strong></div>
        </div>
      </article>

      <article class="admin-panel">
        <h3 class="admin-panel__title">{{ t('admin.odetail.itemsTitle') }}</h3>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>{{ t('admin.odetail.col.name') }}</th>
                <th>{{ t('admin.odetail.col.unit') }}</th>
                <th>{{ t('admin.odetail.col.qty') }}</th>
                <th>{{ t('admin.odetail.col.sub') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.items" :key="item.productId">
                <td>{{ item.name }}</td>
                <td>{{ formatCurrency(item.price, locale) }}</td>
                <td>{{ item.count }}</td>
                <td>{{ formatCurrency((item.price * item.count), locale) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.detail-grid span {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--admin-text-subtle, #9a9a9a);
}

.detail-grid strong {
  color: var(--admin-text, #1a1a1a);
}
</style>
