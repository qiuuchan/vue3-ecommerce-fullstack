import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    // 使用 jsdom 作为测试环境
    environment: 'jsdom',
    // 测试文件匹配规则
    include: ['src/**/*.{test,spec}.{js,ts}'],
    // 全局 API
    globals: true,
    // 测试覆盖率
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx,vue}']
    },
    // 别名配置，与 vite.config.ts 保持一致
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
