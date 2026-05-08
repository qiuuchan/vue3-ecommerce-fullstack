/**
 * 前端错误上报服务（轻量自建方案）
 * 生产环境可将错误信息发送到后端监控接口或第三方服务（如 Sentry）
 */

interface ErrorReport {
  type: 'js-error' | 'unhandledrejection' | 'resource-error' | 'vue-error';
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  // 可选：关联用户
  userId?: string;
}

const REPORT_URL = import.meta.env.VITE_ERROR_REPORT_URL || '';
const MAX_REPORTS = 10; // 单次会话最多上报数，防止刷爆
let reportCount = 0;

function shouldReport(): boolean {
  // 开发环境不上报（避免干扰开发调试）
  if (import.meta.env.DEV) return false;
  if (reportCount >= MAX_REPORTS) return false;
  return true;
}

function sendReport(report: ErrorReport): void {
  reportCount++;

  // 优先使用 sendBeacon（页面关闭时也能发送）
  if (navigator.sendBeacon && REPORT_URL) {
    navigator.sendBeacon(REPORT_URL, JSON.stringify(report));
    return;
  }

  // Fallback：fetch（keepalive 保证页面卸载时也能发送）
  if (REPORT_URL) {
    fetch(REPORT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
      keepalive: true
    }).catch(() => {
      // 上报失败静默处理，避免无限递归
    });
  }

  // 无论是否配置上报地址，都打印到控制台方便排查
  console.error('[ErrorReporter]', report);
}

/** 上报 JS 运行时错误 */
export function reportJSError(error: Error, type: ErrorReport['type'] = 'js-error'): void {
  if (!shouldReport()) return;
  sendReport({
    type,
    message: error.message,
    stack: error.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now()
  });
}

/** 上报 Vue 组件错误 */
export function reportVueError(err: unknown, _instance: unknown, info: string): void {
  if (!shouldReport()) return;
  const error = err instanceof Error ? err : new Error(String(err));
  sendReport({
    type: 'vue-error',
    message: `[${info}] ${error.message}`,
    stack: error.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now()
  });
}

/** 初始化全局错误监听 */
export function initErrorReporter(): void {
  // 监听未捕获的 JS 异常
  window.addEventListener('error', (event) => {
    const error = event.error instanceof Error ? event.error : new Error(event.message);
    reportJSError(error, 'js-error');
  });

  // 监听未处理的 Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const error = reason instanceof Error ? reason : new Error(String(reason));
    reportJSError(error, 'unhandledrejection');
  });

  // 监听静态资源加载失败
  window.addEventListener('error', (event) => {
    const target = event.target as HTMLElement | null;
    if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      if (!shouldReport()) return;
      sendReport({
        type: 'resource-error',
        message: `Resource failed to load: ${(target as HTMLImageElement).src || (target as HTMLScriptElement).src || (target as HTMLLinkElement).href}`,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      });
    }
  }, true);
}
