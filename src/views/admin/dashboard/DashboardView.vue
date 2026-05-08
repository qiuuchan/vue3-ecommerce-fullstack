<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Box, CircleCheck, WarningFilled, Coin } from '@element-plus/icons-vue';
import { fetchDashboardOverview, type DashboardOverview } from '@/api/dashboard';
import { useAdminI18n } from '@/composables/useAdminI18n';
import { formatCurrency } from '@/utils/formatLocale';
import SkeletonLoader from '@/components/SkeletonLoader.vue';

const { t, locale } = useAdminI18n();

/* 分类条：低饱和灰蓝系，避免彩虹色 */
const catColors = ['#5c6f82', '#6b7c8f', '#7a8a9c', '#8b98a8', '#9ca8b5'];

const todoLinks: Record<number, string> = {
  1: '/admin/order/list',
  2: '/admin/inventory/warning',
  3: '/admin/product/list'
};

const loading = ref(true);
const overview = ref<DashboardOverview | null>(null);
const errorMsg = ref('');

const levelTextMap = computed(() => ({
  high: t('dash.level.high'),
  medium: t('dash.level.medium'),
  low: t('dash.level.low')
}));

const maxTrendValue = computed(() => {
  if (!overview.value?.trends.length) return 1;
  return Math.max(...overview.value.trends.map((item) => item.sales), 1);
});

const todaySalesFormatted = computed(() => {
  const val = overview.value?.summary.todaySales || 0;
  if (locale.value === 'en-US') {
    if (val >= 10000) return `${(val / 1000).toFixed(1)}k`;
    return val.toFixed(0);
  }
  if (val >= 10000) return `${(val / 10000).toFixed(1)}${t('dash.wanSuffix')}`;
  return val.toFixed(0);
});

const loadOverview = async (): Promise<void> => {
  loading.value = true;
  errorMsg.value = '';
  try {
    overview.value = await fetchDashboardOverview();
  } catch (error) {
    errorMsg.value = error instanceof Error ? error.message : t('dash.loadFail');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void loadOverview();
});
</script>

<template>
  <div class="admin-page">
    <!-- 页头 -->
    <section class="dash-header anim-fade-up">
      <div>
        <h2 class="admin-toolbar__title">{{ t('dash.title') }}</h2>
        <p class="admin-toolbar__sub">{{ t('dash.subtitle') }}</p>
      </div>
      <div class="admin-actions">
        <button type="button" class="ui-btn ui-btn--ghost" @click="loadOverview">↻ {{ t('dash.refresh') }}</button>
        <router-link to="/admin/product/create" class="ui-btn ui-btn--primary">+ {{ t('dash.addProduct') }}</router-link>
      </div>
    </section>

    <div v-if="loading" class="admin-empty anim-fade-in">
      <SkeletonLoader type="list" :rows="4" />
    </div>
    <div v-else-if="errorMsg" class="admin-empty anim-fade-in">
      <p>{{ errorMsg }}</p>
      <button type="button" class="ui-btn ui-btn--ghost" style="margin-top:14px;" @click="loadOverview">{{ t('dash.retry') }}</button>
    </div>

    <template v-else-if="overview">
      <!-- 统计卡片 -->
      <section class="admin-stats">
        <article class="admin-stat-card anim-fade-up anim-delay-1">
          <div class="stat-icon" aria-hidden="true">
            <el-icon :size="22"><Box /></el-icon>
          </div>
          <p class="admin-stat-card__label">{{ t('dash.stat.newProducts') }}</p>
          <p class="admin-stat-card__value">{{ overview.summary.newProductsToday }}</p>
          <p class="admin-stat-card__trend">{{ t('dash.stat.newProductsUnit') }}</p>
        </article>
        <article class="admin-stat-card anim-fade-up anim-delay-2">
          <div class="stat-icon" aria-hidden="true">
            <el-icon :size="22"><CircleCheck /></el-icon>
          </div>
          <p class="admin-stat-card__label">{{ t('dash.stat.onSale') }}</p>
          <p class="admin-stat-card__value">{{ overview.summary.productsOnSale }}</p>
          <p class="admin-stat-card__trend">{{ t('dash.stat.onSaleUnit') }}</p>
        </article>
        <article class="admin-stat-card anim-fade-up anim-delay-3">
          <div class="stat-icon" aria-hidden="true">
            <el-icon :size="22"><WarningFilled /></el-icon>
          </div>
          <p class="admin-stat-card__label">{{ t('dash.stat.warning') }}</p>
          <p class="admin-stat-card__value">{{ overview.summary.inventoryWarnings }}</p>
          <p class="admin-stat-card__trend">
            <router-link to="/admin/inventory/warning" class="stat-link">{{ t('dash.stat.warningAction') }}</router-link>
          </p>
        </article>
        <article class="admin-stat-card anim-fade-up anim-delay-4">
          <div class="stat-icon" aria-hidden="true">
            <el-icon :size="22"><Coin /></el-icon>
          </div>
          <p class="admin-stat-card__label">{{ t('dash.stat.sales') }}</p>
          <p class="admin-stat-card__value">{{ todaySalesFormatted }}</p>
          <p class="admin-stat-card__trend">{{ overview.summary.todayOrders }} {{ t('dash.stat.ordersUnit') }}</p>
        </article>
      </section>

      <!-- 图表行 -->
      <section class="admin-grid-2">
        <!-- 趋势图 -->
        <article class="admin-panel anim-fade-up anim-delay-1">
          <div class="panel-title-row">
            <h3 class="admin-panel__title">{{ t('dash.trendTitle') }}</h3>
            <span class="panel-hint">{{ t('dash.trendHint') }}</span>
          </div>
          <div class="trend-chart">
            <div v-for="item in overview.trends" :key="item.date" class="trend-col">
              <div class="trend-col__top">
                <div
                  class="trend-bar"
                  :style="{ height: `${Math.max((item.sales / maxTrendValue) * 160, 6)}px` }"
                />
              </div>
              <p class="trend-date">{{ item.date.slice(5) }}</p>
              <p class="trend-val">{{ formatCurrency(item.sales, locale) }}</p>
            </div>
          </div>
        </article>

        <!-- 分类占比 -->
        <article class="admin-panel anim-fade-up anim-delay-2">
          <h3 class="admin-panel__title">{{ t('dash.categoryShare') }}</h3>
          <div class="cat-list">
            <div v-for="(item, index) in overview.categoryShares" :key="item.name" class="cat-row">
              <div class="cat-row__head">
                <div class="cat-dot" :style="{ background: catColors[index % catColors.length] }" />
                <span>{{ item.name }}</span>
                <span class="cat-pct">{{ item.value }}%</span>
              </div>
              <div class="cat-track">
                <div
                  class="cat-fill"
                  :style="{
                    width: `${item.value}%`,
                    background: catColors[index % catColors.length]
                  }"
                />
              </div>
            </div>
          </div>
        </article>
      </section>

      <!-- 热销 + 待办 -->
      <section class="admin-grid-2">
        <!-- 热销排行 -->
        <article class="admin-panel anim-fade-up anim-delay-3">
          <h3 class="admin-panel__title">{{ t('dash.hotTitle') }}</h3>
          <div class="hot-list">
            <div v-for="(item, index) in overview.hotProducts" :key="item.id" class="hot-item">
              <div class="hot-rank" :class="`hot-rank--${index + 1}`">{{ index + 1 }}</div>
              <div class="hot-info">
                <p class="hot-name">{{ item.name }}</p>
                <p class="hot-meta">
                  {{
                    t('dash.hotMeta', {
                      sales: item.sales,
                      revenue: item.revenue.toLocaleString()
                    })
                  }}
                </p>
              </div>
              <div class="hot-bar">
                <div
                  class="hot-bar__fill"
                  :style="{ width: `${(item.sales / (overview.hotProducts[0]?.sales || 1)) * 100}%` }"
                />
              </div>
            </div>
          </div>
        </article>

        <!-- 待处理事项 -->
        <article class="admin-panel anim-fade-up anim-delay-4">
          <h3 class="admin-panel__title">{{ t('dash.todoTitle') }}</h3>
          <div class="todo-list">
            <router-link
              v-for="item in overview.todos"
              :key="item.id"
              :to="todoLinks[item.id] || '/admin/dashboard'"
              class="todo-item"
            >
              <div class="todo-item__left">
                <div class="todo-dot" :class="`todo-dot--${item.level}`" />
                <div>
                  <p class="todo-title">{{ item.title }}</p>
                  <p class="todo-level">{{ levelTextMap[item.level] ?? item.level }}</p>
                </div>
              </div>
              <span class="todo-count" :class="`todo-count--${item.level}`">{{ item.count }}</span>
            </router-link>
          </div>
        </article>
      </section>
    </template>
  </div>
</template>

<style scoped>
.dash-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #e5e5e5;
  border-top-color: #e8532d;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 10px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  margin-bottom: 12px;
  background: #f5f5f5;
  color: #e8532d;
}

.stat-link {
  color: #e8532d;
  font-size: 12px;
}

.panel-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.panel-hint {
  font-size: 12px;
  color: #6b6b6b;
}

.trend-chart {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 220px;
}

.trend-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.trend-col__top {
  flex: 1;
  display: flex;
  align-items: flex-end;
  width: 100%;
}

.trend-bar {
  width: 100%;
  min-height: 6px;
  border-radius: 4px 4px 2px 2px;
  background: #5c6f82;
  box-shadow: none;
  transition: height 0.25s ease;
}

.trend-date {
  font-size: 11px;
  color: #9a9a9a;
}

.trend-val {
  font-size: 11px;
  color: #6b6b6b;
}

.cat-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cat-row__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
  color: #1a1a1a;
}

.cat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cat-pct {
  margin-left: auto;
  font-weight: 600;
}

.cat-track {
  height: 8px;
  border-radius: 999px;
  background: #ececec;
  overflow: hidden;
}

.cat-fill {
  height: 100%;
  border-radius: 999px;
  opacity: 0.9;
  transition: width 0.35s ease;
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hot-rank {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 600;
  background: #f5f5f5;
  color: #6b6b6b;
  flex-shrink: 0;
}

.hot-rank--1 { background: #ececec; color: #1a1a1a; }
.hot-rank--2 { background: #f5f5f5; color: #6b6b6b; }
.hot-rank--3 { background: #f5f5f5; color: #6b6b6b; }

.hot-info {
  flex: 1;
  min-width: 0;
}

.hot-name {
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1a1a1a;
}

.hot-meta {
  font-size: 11px;
  color: #6b6b6b;
  margin-top: 2px;
}

.hot-bar {
  width: 60px;
  height: 4px;
  border-radius: 999px;
  background: #ececec;
  overflow: hidden;
}

.hot-bar__fill {
  height: 100%;
  border-radius: 999px;
  background: #e8532d;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px;
  border-radius: 8px;
  background: #fafafa;
  border: 1px solid #e5e5e5;
  text-decoration: none;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.todo-item:hover {
  background: #fff;
  border-color: #e8532d;
}

.todo-item__left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.todo-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.todo-dot--high   { background: #dc2626; }
.todo-dot--medium { background: #d97706; }
.todo-dot--low    { background: #e8532d; }

.todo-title {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a1a;
}

.todo-level {
  font-size: 12px;
  color: #6b6b6b;
  margin-top: 2px;
}

.todo-count {
  min-width: 36px;
  height: 36px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  font-weight: 600;
  font-size: 16px;
}

.todo-count--high   { background: #fef2f2; color: #dc2626; }
.todo-count--medium { background: #fffbeb; color: #b45309; }
.todo-count--low    { background: #f0f4f8; color: #e8532d; }
</style>
