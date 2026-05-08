<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { useAppI18n } from '@/composables/useAppI18n';

const { t } = useAppI18n();
const hasError = ref(false);
const errorMessage = ref('');

onErrorCaptured((err) => {
  hasError.value = true;
  errorMessage.value = err instanceof Error ? err.message : String(err);
  console.error('[ErrorBoundary] 捕获到渲染异常:', err);
  // 阻止错误继续向上传播
  return false;
});

const reload = (): void => {
  window.location.reload();
};
</script>

<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-boundary__card">
      <h2 class="error-boundary__title">{{ t('errorBoundary.title') }}</h2>
      <p class="error-boundary__desc">{{ t('errorBoundary.desc') }}</p>
      <details v-if="errorMessage" class="error-boundary__detail">
        <summary>{{ t('errorBoundary.detail') }}</summary>
        <pre class="error-boundary__trace">{{ errorMessage }}</pre>
      </details>
      <div class="error-boundary__actions">
        <button class="ui-btn ui-btn--primary" @click="reload">
          {{ t('errorBoundary.reload') }}
        </button>
        <router-link to="/" class="ui-btn ui-btn--ghost">
          {{ t('errorBoundary.goHome') }}
        </router-link>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<style scoped>
.error-boundary {
  min-height: 60vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.error-boundary__card {
  max-width: 520px;
  width: 100%;
  text-align: center;
  padding: 40px 32px;
  border-radius: 16px;
  background: var(--bg, #fff);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.error-boundary__title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text, #1a1a1a);
}

.error-boundary__desc {
  font-size: 14px;
  color: var(--text-muted, #666);
  line-height: 1.6;
  margin-bottom: 20px;
}

.error-boundary__detail {
  text-align: left;
  margin-bottom: 24px;
  font-size: 13px;
  color: var(--text-muted, #666);
}

.error-boundary__trace {
  margin-top: 8px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 12px;
  color: #b91c1c;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-boundary__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
