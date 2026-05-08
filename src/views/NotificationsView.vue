<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Bell, Clock } from '@element-plus/icons-vue';
import { useAppI18n } from '@/composables/useAppI18n';

const { t, locale } = useAppI18n();

interface Notification {
  id: number;
  title: string;
  content: string;
  type: 'order' | 'system' | 'promotion';
  read: boolean;
  createdAt: string;
}

const notifications = ref<Notification[]>([]);
const loading = ref(false);
const filter = ref<'all' | 'unread'>('all');

const loadNotifications = async (): Promise<void> => {
  loading.value = true;
  await new Promise(r => setTimeout(r, 300));
  notifications.value = [
    { id: 1, title: t('notif.orderShipped'), content: t('notif.orderShippedDesc'), type: 'order', read: false, createdAt: '2026-05-06T09:30:00Z' },
    { id: 2, title: t('notif.promotion'), content: t('notif.promotionDesc'), type: 'promotion', read: false, createdAt: '2026-05-05T14:00:00Z' },
    { id: 3, title: t('notif.system'), content: t('notif.systemDesc'), type: 'system', read: true, createdAt: '2026-05-04T10:00:00Z' },
    { id: 4, title: t('notif.orderDelivered'), content: t('notif.orderDeliveredDesc'), type: 'order', read: true, createdAt: '2026-05-03T18:00:00Z' },
    { id: 5, title: t('notif.reviewRemind'), content: t('notif.reviewRemindDesc'), type: 'system', read: true, createdAt: '2026-05-02T08:00:00Z' },
  ];
  loading.value = false;
};

const filteredList = computed(() => {
  if (filter.value === 'unread') return notifications.value.filter(n => !n.read);
  return notifications.value;
});

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);

const markAllRead = (): void => {
  notifications.value.forEach(n => { n.read = true; });
};

const formatTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return t('notif.justNow');
  if (diffH < 24) return `${diffH}h ago`;
  return d.toLocaleDateString(locale.value === 'zh-CN' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' });
};

const typeLabel = (type: string): string => {
  const map: Record<string, string> = {
    order: t('notif.typeOrder'),
    system: t('notif.typeSystem'),
    promotion: t('notif.typePromotion'),
  };
  return map[type] || type;
};

onMounted(() => {
  void loadNotifications();
});
</script>

<template>
  <div class="notif-page">
    <div class="notif-header">
      <h1 class="notif-title">
        <el-icon :size="22"><Bell /></el-icon>
        {{ t('notif.title') }}
      </h1>
      <div class="notif-actions">
        <button
          v-if="unreadCount > 0"
          type="button"
          class="notif-mark-read"
          @click="markAllRead"
        >
          {{ t('notif.markAllRead') }}
        </button>
        <div class="notif-tabs">
          <button
            type="button"
            class="notif-tab"
            :class="{ 'notif-tab--active': filter === 'all' }"
            @click="filter = 'all'"
          >
            {{ t('notif.all') }}
          </button>
          <button
            type="button"
            class="notif-tab"
            :class="{ 'notif-tab--active': filter === 'unread' }"
            @click="filter = 'unread'"
          >
            {{ t('notif.unread') }} ({{ unreadCount }})
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="notif-loading">{{ t('common.loading') }}</div>

    <div v-else-if="filteredList.length === 0" class="notif-empty">
      <el-icon :size="40"><Bell /></el-icon>
      <p>{{ t('notif.empty') }}</p>
    </div>

    <div v-else class="notif-list">
      <div
        v-for="item in filteredList"
        :key="item.id"
        class="notif-item"
        :class="{ 'notif-item--unread': !item.read }"
      >
        <div class="notif-item__dot" />
        <div class="notif-item__content">
          <div class="notif-item__header">
            <span class="notif-item__tag">{{ typeLabel(item.type) }}</span>
            <span class="notif-item__title">{{ item.title }}</span>
          </div>
          <p class="notif-item__text">{{ item.content }}</p>
          <span class="notif-item__time">
            <el-icon :size="12"><Clock /></el-icon>
            {{ formatTime(item.createdAt) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notif-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.notif-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.notif-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notif-mark-read {
  border: none;
  background: transparent;
  color: var(--f-brand, #e8532d);
  font-size: 0.8125rem;
  cursor: pointer;
}

.notif-tabs {
  display: flex;
  gap: 2px;
  background: #f5f5f5;
  border-radius: 6px;
  padding: 2px;
}

.notif-tab {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  background: transparent;
  font-size: 0.8125rem;
  color: #6b6b6b;
  cursor: pointer;
}

.notif-tab--active {
  background: #fff;
  color: #1a1a1a;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,.06);
}

.notif-loading {
  text-align: center;
  padding: 60px 0;
  color: #9a9a9a;
}

.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 0;
  color: #bdbdbd;
}

.notif-list {
  display: flex;
  flex-direction: column;
}

.notif-item {
  display: flex;
  gap: 12px;
  padding: 16px 12px;
  border-bottom: 1px solid #f5f5f5;
  border-radius: 8px;
  transition: background 0.15s;
}

.notif-item:hover {
  background: #fafafa;
}

.notif-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 8px;
  flex-shrink: 0;
}

.notif-item--unread .notif-item__dot {
  background: var(--f-brand, #e8532d);
}

.notif-item__content {
  flex: 1;
  min-width: 0;
}

.notif-item__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.notif-item__tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--f-brand, #e8532d);
  background: #fdf0ec;
  flex-shrink: 0;
}

.notif-item__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1a1a1a;
}

.notif-item__text {
  font-size: 0.8125rem;
  color: #6b6b6b;
  margin: 4px 0 6px;
  line-height: 1.5;
}

.notif-item__time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #bdbdbd;
}
</style>
