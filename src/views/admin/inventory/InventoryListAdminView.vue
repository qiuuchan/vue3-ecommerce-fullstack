<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchInventoryList, updateInventoryApi, type InventoryItem } from '@/api/inventory';
import { useAppI18n } from '@/composables/useAppI18n';
import { toastError } from '@/utils/toast';

const { t } = useAppI18n();
const inventories = ref<InventoryItem[]>([]);
const loading = ref(true);
const keyword = ref('');
const statusFilter = ref('');

const filtered = computed(() => {
  let list = inventories.value;
  if (keyword.value) {
    const kw = keyword.value.toLowerCase();
    list = list.filter((item) => item.name.toLowerCase().includes(kw) || item.sku.toLowerCase().includes(kw));
  }
  if (statusFilter.value) {
    list = list.filter((item) => item.status === statusFilter.value);
  }
  return list;
});

const warningCount = computed(() => inventories.value.filter((item) => item.status === 'warning').length);

const loadInventories = async (): Promise<void> => {
  loading.value = true;
  try {
    inventories.value = await fetchInventoryList();
  } finally {
    loading.value = false;
  }
};

const updateStock = async (item: InventoryItem): Promise<void> => {
  const raw = window.prompt(t('admin.inv.prompt', { name: item.name, stock: item.stock }), String(item.stock));
  if (raw === null) return;
  const stock = Number(raw);
  if (Number.isNaN(stock) || stock < 0) {
    toastError(t('admin.inv.badStock'));
    return;
  }
  try {
    await updateInventoryApi(item.productId, stock);
    await loadInventories();
  } catch (error) {
    toastError(error instanceof Error ? error.message : t('admin.inv.updateFail'));
  }
};

onMounted(() => {
  void loadInventories();
});
</script>

<template>
  <div class="admin-page">
    <section class="admin-toolbar anim-fade-up">
      <div>
        <h2 class="admin-toolbar__title">{{ t('admin.inv.title') }}</h2>
        <p class="admin-toolbar__sub">{{ t('admin.inv.sub') }}</p>
      </div>
      <div class="admin-actions">
        <span v-if="warningCount > 0" class="admin-chip admin-chip--warning">{{ t('admin.inv.warnChip', { n: warningCount }) }}</span>
        <router-link to="/admin/inventory/warning" class="ui-btn ui-btn--ghost">{{ t('admin.inv.gotoWarn') }}</router-link>
      </div>
    </section>

    <!-- 筛选 -->
    <section class="admin-panel anim-fade-up anim-delay-1">
      <div class="admin-filters">
        <input v-model="keyword" class="admin-input" :placeholder="t('admin.inv.searchPh')" />
        <select v-model="statusFilter" class="admin-select">
          <option value="">{{ t('admin.inv.allStatus') }}</option>
          <option value="normal">{{ t('admin.inv.normal') }}</option>
          <option value="warning">{{ t('admin.inv.warningOpt') }}</option>
        </select>
      </div>
    </section>

    <!-- 列表 -->
    <section class="admin-panel anim-fade-up anim-delay-2">
      <div v-if="loading" class="admin-empty">{{ t('admin.inv.loading') }}</div>
      <div v-else-if="filtered.length === 0" class="admin-empty">{{ t('admin.inv.empty') }}</div>

      <div v-else class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>{{ t('admin.inv.col.name') }}</th>
              <th>{{ t('admin.inv.col.sku') }}</th>
              <th>{{ t('admin.inv.col.stock') }}</th>
              <th>{{ t('admin.inv.col.safe') }}</th>
              <th>{{ t('admin.inv.col.ratio') }}</th>
              <th>{{ t('admin.inv.col.sales') }}</th>
              <th>{{ t('admin.inv.col.status') }}</th>
              <th>{{ t('admin.inv.col.action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filtered" :key="item.productId">
              <td>{{ item.name }}</td>
              <td class="td-mono">{{ item.sku }}</td>
              <td :class="{ 'stock-warn': item.status === 'warning' }">{{ item.stock }}</td>
              <td>{{ item.safeStock }}</td>
              <td>
                <div class="stock-bar">
                  <div
                    class="stock-bar__fill"
                    :class="item.status === 'warning' ? 'stock-bar__fill--warn' : ''"
                    :style="{ width: `${Math.min((item.stock / (item.safeStock * 3 || 1)) * 100, 100)}%` }"
                  />
                </div>
                <span class="stock-pct">{{ Math.round((item.stock / (item.safeStock * 3 || 1)) * 100) }}%</span>
              </td>
              <td>{{ item.sales }}</td>
              <td>
                <span
                  class="admin-chip"
                  :class="item.status === 'warning' ? 'admin-chip--warning' : 'admin-chip--success'"
                >
                  {{ item.status === 'warning' ? t('admin.inv.statusWarn') : t('admin.inv.statusOk') }}
                </span>
              </td>
              <td>
                <button type="button" class="ui-btn ui-btn--ghost ui-btn--sm" @click="updateStock(item)">
                  {{ t('admin.inv.editStock') }}
                </button>
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

.stock-warn {
  color: #b45309;
  font-weight: 600;
}

.stock-bar {
  height: 6px;
  background: var(--admin-border, #e5e5e5);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 4px;
  min-width: 60px;
}

.stock-bar__fill {
  height: 100%;
  border-radius: 999px;
  background: #2d6a4f;
}

.stock-bar__fill--warn {
  background: #dc2626;
}

.stock-pct {
  font-size: 11px;
  color: var(--admin-text-subtle, #9a9a9a);
}
</style>
