<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchInventoryWarnings, type InventoryItem } from '@/api/inventory';
import { useAppI18n } from '@/composables/useAppI18n';

const { t } = useAppI18n();
const warnings = ref<InventoryItem[]>([]);

onMounted(async () => {
  warnings.value = await fetchInventoryWarnings();
});
</script>

<template>
  <div class="admin-page">
    <section class="admin-toolbar">
      <div>
        <h2 class="admin-toolbar__title">{{ t('admin.invw.title') }}</h2>
        <p class="admin-toolbar__sub">{{ t('admin.invw.sub') }}</p>
      </div>
    </section>

    <section class="admin-card-list">
      <article v-for="item in warnings" :key="item.productId" class="admin-mini-card">
        <span class="admin-chip admin-chip--warning">{{ t('admin.invw.badge') }}</span>
        <h3 class="warning-title">{{ item.name }}</h3>
        <p class="warning-meta">{{ t('admin.invw.skuLine', { sku: item.sku }) }}</p>
        <div class="warning-stats">
          <span>{{ t('admin.invw.curStock', { n: item.stock }) }}</span>
          <span>{{ t('admin.invw.safeStock', { n: item.safeStock }) }}</span>
        </div>
      </article>
      <div v-if="warnings.length === 0" class="admin-empty">{{ t('admin.invw.empty') }}</div>
    </section>
  </div>
</template>

<style scoped>
.warning-title {
  margin: 14px 0 6px;
  color: var(--admin-text, #1a1a1a);
  font-weight: 600;
}

.warning-meta {
  color: var(--admin-text-muted, #6b6b6b);
  font-size: 13px;
}

.warning-stats {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--admin-text, #1a1a1a);
}
</style>
