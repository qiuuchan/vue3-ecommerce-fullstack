import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useNetworkStatus } from '@/composables/useNetworkStatus';

const TestComponent = {
  setup() {
    const { isOnline } = useNetworkStatus();
    return { isOnline };
  },
  template: '<div>{{ isOnline }}</div>',
};

describe('useNetworkStatus', () => {
  let onlineStatus = true;

  beforeEach(() => {
    onlineStatus = true;
    vi.stubGlobal('navigator', {
      onLine: true,
    });
    // Keep a live reference so events can flip it
    Object.defineProperty(navigator, 'onLine', {
      get: () => onlineStatus,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should reflect initial online state', () => {
    const wrapper = mount(TestComponent);
    expect(wrapper.text()).toBe('true');
  });

  it('should update to offline when offline event fires', async () => {
    const wrapper = mount(TestComponent);
    onlineStatus = false;
    window.dispatchEvent(new Event('offline'));
    await nextTick();
    expect(wrapper.text()).toBe('false');
  });

  it('should update back to online when online event fires', async () => {
    const wrapper = mount(TestComponent);
    onlineStatus = false;
    window.dispatchEvent(new Event('offline'));
    await nextTick();

    onlineStatus = true;
    window.dispatchEvent(new Event('online'));
    await nextTick();
    expect(wrapper.text()).toBe('true');
  });
});
