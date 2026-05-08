/**
 * Web Vitals 性能采集：使用原生 Performance Observer 收集 LCP、FID、CLS
 * 商用项目可将数据上报到监控后台，用于性能优化决策。
 */

interface WebVitalsReport {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  entries: PerformanceEntry[];
}

type ReportHandler = (metric: WebVitalsReport) => void;

function getRating(name: string, value: number): WebVitalsReport['rating'] {
  switch (name) {
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'FID':
      return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    default:
      return 'good';
  }
}

/** 采集 LCP（最大内容绘制） */
export function observeLCP(onReport: ReportHandler): void {
  if (!('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
    if (lastEntry) {
      onReport({
        name: 'LCP',
        value: Math.round(lastEntry.startTime),
        rating: getRating('LCP', lastEntry.startTime),
        entries
      });
    }
  });

  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] as string[] });
  } catch {
    // 浏览器不支持
  }
}

/** 采集 FID（首次输入延迟） */
export function observeFID(onReport: ReportHandler): void {
  if (!('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const e = entry as PerformanceEntry & { processingStart: number; startTime: number };
      const value = e.processingStart - e.startTime;
      onReport({
        name: 'FID',
        value: Math.round(value),
        rating: getRating('FID', value),
        entries: [entry]
      });
    }
  });

  try {
    observer.observe({ entryTypes: ['first-input'] as string[] });
  } catch {
    // 浏览器不支持
  }
}

/** 采集 CLS（累积布局偏移） */
export function observeCLS(onReport: ReportHandler): void {
  if (!('PerformanceObserver' in window)) return;

  let clsValue = 0;
  let sessionEntries: PerformanceEntry[] = [];

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const e = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
      if (!e.hadRecentInput) {
        clsValue += e.value;
        sessionEntries.push(entry);
      }
    }
  });

  try {
    observer.observe({ entryTypes: ['layout-shift'] as string[] });
  } catch {
    return;
  }

  // CLS 需要在页面生命周期结束时上报
  const reportCLS = (): void => {
    onReport({
      name: 'CLS',
      value: Math.round(clsValue * 1000) / 1000,
      rating: getRating('CLS', clsValue),
      entries: sessionEntries
    });
    observer.disconnect();
  };

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      reportCLS();
    }
  });
}

/** 采集 FCP（首次内容绘制） */
export function observeFCP(onReport: ReportHandler): void {
  if (!('PerformanceObserver' in window)) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const e = entry as PerformanceEntry & { startTime: number };
      if (entry.name === 'first-contentful-paint') {
        onReport({
          name: 'FCP',
          value: Math.round(e.startTime),
          rating: getRating('FCP', e.startTime),
          entries: [entry]
        });
        observer.disconnect();
      }
    }
  });

  try {
    observer.observe({ entryTypes: ['paint'] as string[] });
  } catch {
    // 浏览器不支持
  }
}

/** 采集 TTFB（首字节时间） */
export function observeTTFB(onReport: ReportHandler): void {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (nav) {
    const value = nav.responseStart - nav.startTime;
    onReport({
      name: 'TTFB',
      value: Math.round(value),
      rating: getRating('TTFB', value),
      entries: [nav]
    });
  }
}

/** 采集 Long Tasks（长任务，主线程阻塞） */
export function observeLongTasks(onReport: ReportHandler): void {
  if (!('PerformanceObserver' in window)) return;
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const e = entry as PerformanceEntry & { duration: number };
      onReport({
        name: 'LongTask',
        value: Math.round(e.duration),
        rating: e.duration > 200 ? 'poor' : e.duration > 50 ? 'needs-improvement' : 'good',
        entries: [entry]
      });
    }
  });
  try {
    observer.observe({ entryTypes: ['longtask'] as string[] });
  } catch {
    // 浏览器不支持
  }
}

/** 启动全部 Web Vitals 采集 */
export function observeAllWebVitals(onReport: ReportHandler): void {
  observeTTFB(onReport);
  observeFCP(onReport);
  observeLCP(onReport);
  observeFID(onReport);
  observeCLS(onReport);
  observeLongTasks(onReport);
}
