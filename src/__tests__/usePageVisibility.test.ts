import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { usePageVisibility } from '@/composables/usePageVisibility';

const TestComponent = {
  props: ['onShow'],
  setup(props: { onShow?: () => void }) {
    const { isVisible } = usePageVisibility(props.onShow);
    return { isVisible };
  },
  template: '<div>{{ isVisible }}</div>',
};

describe('usePageVisibility', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'hidden', {
      value: false,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should reflect initial visible state', () => {
    const wrapper = mount(TestComponent);
    expect(wrapper.text()).toBe('true');
  });

  it('should call onShow when mounted if visible', () => {
    const onShow = vi.fn();
    mount(TestComponent, { props: { onShow } });
    expect(onShow).toHaveBeenCalledTimes(1);
  });

  it('should not call onShow when mounted if hidden', () => {
    Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
    const onShow = vi.fn();
    mount(TestComponent, { props: { onShow } });
    expect(onShow).not.toHaveBeenCalled();
  });

  it('should update isVisible when document becomes hidden', async () => {
    const wrapper = mount(TestComponent);
    Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    await nextTick();
    expect(wrapper.text()).toBe('false');
  });
});
