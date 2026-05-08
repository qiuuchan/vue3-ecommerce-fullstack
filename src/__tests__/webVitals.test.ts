import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  observeAllWebVitals,
  observeLCP,
  observeFID,
  observeCLS,
  observeFCP,
  observeTTFB,
} from '@/utils/webVitals';

describe('webVitals', () => {
  let callbacks: Array<(list: { getEntries: () => unknown[] }) => void> = [];

  beforeEach(() => {
    callbacks = [];
    vi.stubGlobal(
      'PerformanceObserver',
      vi.fn().mockImplementation((cb: (list: unknown) => void) => {
        callbacks.push(cb as (list: { getEntries: () => unknown[] }) => void);
        return {
          observe: vi.fn(),
          disconnect: vi.fn(),
        };
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('observeLCP triggers callback with LCP metric', () => {
    const cb = vi.fn();
    observeLCP(cb);
    expect(PerformanceObserver).toHaveBeenCalled();

    const entry = { startTime: 1200 };
    callbacks[0]!({ getEntries: () => [entry] });
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'LCP', value: 1200, rating: 'good' })
    );
  });

  it('observeFID triggers callback with FID metric', () => {
    const cb = vi.fn();
    observeFID(cb);
    const entry = { processingStart: 30, startTime: 10 };
    callbacks[0]!({ getEntries: () => [entry] });
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'FID', value: 20, rating: 'good' })
    );
  });

  it('observeCLS triggers callback with CLS metric on visibilitychange', () => {
    const cb = vi.fn();
    observeCLS(cb);
    const entry = { value: 0.05, hadRecentInput: false };
    callbacks[0]!({ getEntries: () => [entry] });
    // CLS is reported on visibilitychange
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
    window.dispatchEvent(new Event('visibilitychange'));
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'CLS', value: 0.05, rating: 'good' })
    );
  });

  it('observeCLS should ignore entries with hadRecentInput', () => {
    const cb = vi.fn();
    observeCLS(cb);
    const entry = { value: 0.5, hadRecentInput: true };
    callbacks[0]!({ getEntries: () => [entry] });
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
    window.dispatchEvent(new Event('visibilitychange'));
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'CLS', value: 0, rating: 'good' })
    );
  });

  it('observeFCP triggers callback with FCP metric', () => {
    const cb = vi.fn();
    observeFCP(cb);
    const entry = { name: 'first-contentful-paint', startTime: 900 };
    callbacks[0]!({ getEntries: () => [entry] });
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'FCP', value: 900, rating: 'good' })
    );
  });

  it('observeTTFB triggers callback with TTFB metric', () => {
    vi.stubGlobal('performance', {
      getEntriesByType: vi.fn().mockReturnValue([{ responseStart: 200, startTime: 0 }]),
    });
    const cb = vi.fn();
    observeTTFB(cb);
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'TTFB', value: 200, rating: 'good' })
    );
  });

  it('observeAllWebVitals registers all observers', () => {
    const cb = vi.fn();
    observeAllWebVitals(cb);
    // LCP, FID, CLS, FCP = 4 PerformanceObservers; TTFB uses getEntriesByType
    expect(callbacks.length).toBeGreaterThanOrEqual(4);
  });

  it('LCP rating should be needs-improvement when 2500<value<=4000', () => {
    const cb = vi.fn();
    observeLCP(cb);
    const entry = { startTime: 3000 };
    callbacks[0]!({ getEntries: () => [entry] });
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'LCP', value: 3000, rating: 'needs-improvement' })
    );
  });

  it('LCP rating should be poor when >4000', () => {
    const cb = vi.fn();
    observeLCP(cb);
    const entry = { startTime: 4500 };
    callbacks[0]!({ getEntries: () => [entry] });
    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'LCP', value: 4500, rating: 'poor' })
    );
  });
});
