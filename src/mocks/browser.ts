import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 浏览器端 Mock Worker：与 public/mockServiceWorker.js 配合
export const worker = setupWorker(...handlers);

export async function startMockWorker(): Promise<void> {
  // 默认从网站根路径加载 /mockServiceWorker.js（见 public/mockServiceWorker.js）
  await worker.start({ onUnhandledRequest: 'bypass' });
}
