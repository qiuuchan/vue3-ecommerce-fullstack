import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import router from '@/router';
import { useUserStore } from '@/stores/userStore';
import { useLocaleStore } from '@/stores/localeStore';
import { initErrorReporter, reportVueError } from '@/utils/errorReporter';
import { observeAllWebVitals } from '@/utils/webVitals';
import '@/style.css';

async function bootstrap(): Promise<void> {
  // 开发时可选：无后端只演示列表（.env 中 VITE_USE_MSW=true）
  if (import.meta.env.VITE_USE_MSW === 'true') {
    const { startMockWorker } = await import('@/mocks/browser');
    await startMockWorker();
  }

  const app = createApp(App);
  app.use(ElementPlus);
  app.use(createPinia());

  useLocaleStore().initFromStorage();
  useUserStore().initFromStorage();

  app.use(router);

  // 全局错误处理：捕获未处理的 Vue 渲染异常，避免白屏
  app.config.errorHandler = (err, instance, info) => {
    console.error('[Global Error]', err, info, instance);
    reportVueError(err, instance, info);
  };

  app.mount('#app');

  // 初始化全局错误监听（JS 异常、Promise 拒绝、资源加载失败）
  initErrorReporter();

  // 采集 Web Vitals 性能指标（LCP/FID/CLS/FCP/TTFB）
  observeAllWebVitals((metric) => {
    // 生产环境可替换为实际上报地址
    console.log('[WebVitals]', metric.name, metric.value, metric.rating);
  });
}

bootstrap().catch((e) => {
  console.error('应用启动失败：', e);
});
