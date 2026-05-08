import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import AppLanguageSwitch from './AppLanguageSwitch.vue';

describe('AppLanguageSwitch', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('渲染语言下拉且含中文与 English 选项', () => {
    const wrapper = mount(AppLanguageSwitch);
    const select = wrapper.find('select.lang-switch__select');
    expect(select.exists()).toBe(true);
    const options = wrapper.findAll('option');
    const values = options.map((o) => o.attributes('value'));
    expect(values).toContain('zh-CN');
    expect(values).toContain('en-US');
  });
});
