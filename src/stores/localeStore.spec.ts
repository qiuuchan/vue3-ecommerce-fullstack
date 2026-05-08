import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useLocaleStore } from './localeStore';

describe('localeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    document.documentElement.lang = '';
  });

  it('默认为 zh-CN', () => {
    const store = useLocaleStore();
    expect(store.locale).toBe('zh-CN');
  });

  it('initFromStorage 从 localStorage 读取语言', () => {
    localStorage.setItem('app_locale', 'en-US');
    const store = useLocaleStore();
    store.initFromStorage();
    expect(store.locale).toBe('en-US');
    expect(document.documentElement.lang).toBe('en');
  });

  it('initFromStorage 忽略非法值，保持默认', () => {
    localStorage.setItem('app_locale', 'fr');
    const store = useLocaleStore();
    store.initFromStorage();
    expect(store.locale).toBe('zh-CN');
  });

  it('setLocale 切换语言并持久化', () => {
    const store = useLocaleStore();
    store.setLocale('en-US');
    expect(store.locale).toBe('en-US');
    expect(localStorage.getItem('app_locale')).toBe('en-US');
    expect(document.documentElement.lang).toBe('en');
  });

  it('setLocale 切回中文', () => {
    const store = useLocaleStore();
    store.setLocale('en-US');
    store.setLocale('zh-CN');
    expect(store.locale).toBe('zh-CN');
    expect(document.documentElement.lang).toBe('zh-CN');
  });
});
