<script setup lang="ts">
import { useAppI18n } from '@/composables/useAppI18n';
import type { AppLocale } from '@/i18n/messages';

const { locale, setLocale, t } = useAppI18n();

const onChange = (e: Event): void => {
  const v = (e.target as HTMLSelectElement).value as AppLocale;
  setLocale(v);
};
</script>

<template>
  <label class="lang-switch">
    <span class="lang-switch__label">{{ t('front.lang.label') }}</span>
    <select class="lang-switch__select" :value="locale" @change="onChange">
      <option value="zh-CN">{{ t('lang.zhCN') }}</option>
      <option value="en-US">{{ t('lang.enUS') }}</option>
    </select>
  </label>
</template>

<style scoped>
.lang-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
}

.lang-switch__label {
  color: inherit;
  opacity: 0.75;
  white-space: nowrap;
}

.lang-switch__select {
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--f-border, #e5e5e5);
  background: #fff;
  color: var(--f-text, #1a1a1a);
  cursor: pointer;
}

/* 后台顶栏改为浅底后，语言选择与前台一致 */
:global(.admin-topbar) .lang-switch__select {
  border-color: #e5e5e5;
  background: #fff;
  color: #1a1a1a;
}

:global(.login-card) .lang-switch__select {
  border-color: var(--c-border, rgba(255, 255, 255, 0.12));
  background: rgba(0, 0, 0, 0.2);
  color: var(--c-text, #e2e8f0);
}
</style>
