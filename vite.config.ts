import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

// @ 指向项目里的 src 目录，这样可以用 import xxx from '@/xxx'
const resolveSrc = fileURLToPath(new URL('./src', import.meta.url));

// Vite 核心配置
export default defineConfig(({ mode }) => {
  // 加载当前模式的环境变量
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolveSrc
      }
    },
    // 开发服务器配置
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      },
      // 启动时自动打开浏览器
      open: true
    },
    // 构建配置（生产环境优化）
    build: {
      // 生成 sourcemap，方便调试生产环境问题
      sourcemap: true,
      // 使用 esbuild 压缩（Vite 内置，无需额外安装）
      minify: 'esbuild',
      // Rollup 配置，进行代码分割
      rollupOptions: {
        output: {
          // 手动分包，将第三方库单独打包，利用浏览器缓存
          manualChunks: {
            // Vue 相关库
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            // HTTP 请求库
            'http-vendor': ['axios'],
            // UI 组件库（体积大，单独缓存）
            'ui-vendor': ['element-plus'],
            // 图标库
            'icon-vendor': ['@element-plus/icons-vue']
          },
          // 分类输出文件
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
        }
      },
      // 触发警告的 chunk 大小（单位：kb）
      // ui-vendor (element-plus) 和 vue-vendor 体积较大但缓存效率高，允许 900 kB
      chunkSizeWarningLimit: 900
    },
    // CSS 配置
    css: {
      // 启用 CSS Modules
      modules: {
        localsConvention: 'camelCase',
        scopeBehaviour: 'local'
      },
      // 开发时启用 CSS sourcemap
      devSourcemap: true
    },
    // 全局常量注入
    define: {
      // 注入应用标题
      __APP_TITLE__: JSON.stringify(env.VITE_APP_TITLE || '跨区域电商演示系统'),
      // 注入调试模式标识
      __DEBUG__: env.VITE_DEBUG === 'true'
    }
  };
});
