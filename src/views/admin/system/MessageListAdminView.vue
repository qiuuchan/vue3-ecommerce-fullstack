<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fetchMessageList, markMessageReadApi, type MessageItem } from '@/api/message';
import { useAppI18n } from '@/composables/useAppI18n';

const { t } = useAppI18n();
const messages = ref<MessageItem[]>([]);

const loadMessages = async (): Promise<void> => {
  messages.value = await fetchMessageList();
};

const markRead = async (id: number): Promise<void> => {
  await markMessageReadApi(id);
  await loadMessages();
};

onMounted(() => {
  void loadMessages();
});
</script>

<template>
  <div class="admin-page">
    <section class="admin-toolbar">
      <div>
        <h2 class="admin-toolbar__title">{{ t('admin.msg.title') }}</h2>
        <p class="admin-toolbar__sub">{{ t('admin.msg.sub') }}</p>
      </div>
    </section>

    <section class="admin-card-list">
      <article v-for="item in messages" :key="item.id" class="admin-mini-card">
        <div class="message-head">
          <span class="admin-chip" :class="item.isRead ? 'admin-chip--success' : 'admin-chip--warning'">
            {{ item.isRead ? t('admin.msg.read') : t('admin.msg.unread') }}
          </span>
          <span class="message-type">{{ item.type }}</span>
        </div>
        <h3 class="message-title">{{ item.title }}</h3>
        <p class="message-content">{{ item.content }}</p>
        <div class="message-footer">
          <span>{{ item.createdAt }}</span>
          <button v-if="!item.isRead" type="button" class="ui-btn ui-btn--ghost ui-btn--sm" @click="markRead(item.id)">
            {{ t('admin.msg.markRead') }}
          </button>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.message-head,
.message-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.message-type,
.message-footer span {
  color: var(--admin-text-subtle, #9a9a9a);
  font-size: 12px;
}

.message-title {
  margin: 16px 0 8px;
  color: var(--admin-text, #1a1a1a);
  font-weight: 600;
}

.message-content {
  color: var(--admin-text-muted, #6b6b6b);
  min-height: 44px;
}

.message-footer {
  margin-top: 18px;
}
</style>
