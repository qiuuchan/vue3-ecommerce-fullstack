import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { AppLocale } from '@/i18n/messages';

const STORAGE_KEY = 'app_locale';

// 全站界面语言：持久化到 localStorage，并同步 html lang
export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<AppLocale>('zh-CN');

  const applyDocumentLang = (): void => {
    document.documentElement.lang = locale.value === 'en-US' ? 'en' : 'zh-CN';
  };

  const initFromStorage = (): void => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === 'en-US' || raw === 'zh-CN') {
        locale.value = raw;
      }
    } catch {
      // 忽略存储异常
    }
    applyDocumentLang();
  };

  const setLocale = (next: AppLocale): void => {
    locale.value = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      console.warn('无法写入语言偏好到 localStorage');
    }
    applyDocumentLang();
  };

  watch(locale, () => {
    applyDocumentLang();
  });

  return {
    locale,
    initFromStorage,
    setLocale
  };
});
