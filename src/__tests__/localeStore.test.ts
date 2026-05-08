import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLocaleStore } from '@/stores/localeStore';

describe('localeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    document.documentElement.lang = '';
  });

  it('默认 locale 应为 zh-CN', () => {
    const store = useLocaleStore();
    expect(store.locale).toBe('zh-CN');
  });

  it('setLocale 应更新 locale 并写入 localStorage', () => {
    const store = useLocaleStore();
    store.setLocale('en-US');
    expect(store.locale).toBe('en-US');
    expect(localStorage.getItem('app_locale')).toBe('en-US');
  });

  it('setLocale 应同步 html lang 属性', () => {
    const store = useLocaleStore();
    store.setLocale('en-US');
    expect(document.documentElement.lang).toBe('en');
  });

  it('setLocale 为 zh-CN 时 html lang 应为 zh-CN', () => {
    const store = useLocaleStore();
    store.setLocale('en-US');
    store.setLocale('zh-CN');
    expect(document.documentElement.lang).toBe('zh-CN');
  });

  it('initFromStorage 应从 localStorage 恢复 locale', () => {
    localStorage.setItem('app_locale', 'en-US');
    const store = useLocaleStore();
    store.initFromStorage();
    expect(store.locale).toBe('en-US');
  });

  it('initFromStorage 遇到非法值应保持默认值', () => {
    localStorage.setItem('app_locale', 'fr-FR');
    const store = useLocaleStore();
    store.initFromStorage();
    expect(store.locale).toBe('zh-CN');
  });

  it('localStorage 写入失败不应抛异常', () => {
    const store = useLocaleStore();
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new Error('QuotaExceeded');
    });
    expect(() => store.setLocale('en-US')).not.toThrow();
    localStorage.setItem = originalSetItem;
  });
});
