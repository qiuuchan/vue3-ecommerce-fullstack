<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { fetchAdminProductDetail } from '@/api/product';
import { useAppI18n } from '@/composables/useAppI18n';
import { formatCurrency } from '@/utils/formatLocale';
import type { Product } from '@/types/product';

const { t, locale } = useAppI18n();
const route = useRoute();
const product = ref<Product | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    product.value = await fetchAdminProductDetail(Number(route.params.id));
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="admin-page">
    <section class="admin-toolbar">
      <div>
        <h2 class="admin-toolbar__title">{{ t('admin.pdetail.title') }}</h2>
        <p class="admin-toolbar__sub">{{ t('admin.pdetail.sub') }}</p>
      </div>
    </section>

    <div v-if="loading" class="admin-empty">{{ t('admin.pdetail.loading') }}</div>

    <section v-else-if="product" class="admin-grid-2">
      <article class="admin-panel">
        <img :src="product.cover" :alt="product.name" class="detail-cover" />
      </article>

      <article class="admin-panel detail-info">
        <h3 class="detail-name">{{ product.name }}</h3>
        <p class="detail-desc">{{ product.description || t('admin.product.noDesc') }}</p>
        <div class="detail-meta">
          <div><span>{{ t('admin.pdetail.sku') }}</span><strong>{{ product.sku }}</strong></div>
          <div><span>{{ t('admin.pdetail.cat') }}</span><strong>{{ product.categoryName }}</strong></div>
          <div><span>{{ t('admin.pdetail.price') }}</span><strong>{{ formatCurrency(product.price, locale) }}</strong></div>
          <div><span>{{ t('admin.pdetail.orig') }}</span><strong>{{ formatCurrency((product.originalPrice || 0), locale) }}</strong></div>
          <div><span>{{ t('admin.pdetail.stock') }}</span><strong>{{ product.stock }}</strong></div>
          <div><span>{{ t('admin.pdetail.sales') }}</span><strong>{{ product.sales }}</strong></div>
          <div><span>{{ t('admin.pdetail.status') }}</span><strong>{{ product.status === 'on_sale' ? t('admin.product.onSaleChip') : t('admin.product.offChip') }}</strong></div>
          <div><span>{{ t('admin.pdetail.updated') }}</span><strong>{{ product.updatedAt }}</strong></div>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.detail-cover {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 22px;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-name {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--admin-text, #1a1a1a);
}

.detail-desc {
  color: var(--admin-text-muted, #6b6b6b);
}

.detail-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.detail-meta span {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--admin-text-subtle, #9a9a9a);
}

.detail-meta strong {
  color: var(--admin-text, #1a1a1a);
}
</style>
