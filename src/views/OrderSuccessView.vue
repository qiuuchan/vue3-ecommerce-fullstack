<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CircleCheck } from '@element-plus/icons-vue';
import { fetchUserOrderDetail } from '@/api/order';
import type { UserOrder } from '@/types/order';
import { useAppI18n } from '@/composables/useAppI18n';
import { formatCurrency } from '@/utils/formatLocale';

const route = useRoute();
const router = useRouter();
const { t, locale } = useAppI18n();

const order = ref<UserOrder | null>(null);
const loading = ref(true);

onMounted(async () => {
  const orderId = Number(route.params.orderId);
  if (!orderId) {
    await router.replace('/products');
    return;
  }
  try {
    order.value = await fetchUserOrderDetail(orderId);
  } catch {
    // 加载失败也展示成功页面，只是不显示金额
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="success-page">
    <div class="success-card">
      <el-icon class="success-icon" :size="64"><CircleCheck /></el-icon>
      <h1 class="success-title">{{ t('orderSuccess.title') }}</h1>
      <p class="success-desc">{{ t('orderSuccess.desc') }}</p>

      <div v-if="!loading && order" class="success-info">
        <p class="success-line">
          <span>{{ t('orderSuccess.orderNo') }}</span>
          <strong>{{ order.orderNo }}</strong>
        </p>
        <p class="success-line">
          <span>{{ t('orderSuccess.amount') }}</span>
          <strong class="success-amount">{{ formatCurrency(order.totalAmount, locale) }}</strong>
        </p>
      </div>

      <div class="success-actions">
        <router-link :to="order ? `/user/orders/${order.id}` : '/user/orders'" class="ui-btn ui-btn--primary">
          {{ t('orderSuccess.viewOrder') }}
        </router-link>
        <router-link to="/products" class="ui-btn ui-btn--ghost">
          {{ t('orderSuccess.continue') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.success-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
}

.success-card {
  text-align: center;
  max-width: 480px;
  width: 100%;
  padding: 48px 32px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
}

.success-icon {
  color: #15803d;
  margin-bottom: 20px;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.success-desc {
  font-size: .9375rem;
  color: #6b6b6b;
  margin-bottom: 24px;
}

.success-info {
  margin-bottom: 28px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.success-line {
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: 6px 0;
  font-size: .9375rem;
  color: #4b4b4b;
}

.success-amount {
  color: #b91c1c;
  font-size: 1.125rem;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
