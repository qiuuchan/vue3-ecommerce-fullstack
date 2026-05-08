/// <reference types="vite/client" />
// TS 5.8+ 在启用 DOM lib 时会隐式拉取 web-bluetooth；显式引用保证能解析到 @types/web-bluetooth（消除 tsconfig 红线）
/// <reference types="web-bluetooth" />

// 必须先 side-effect import，再 declare module，否则会变成「重写整个 vue-router」导致 useRouter 等导出全丢
import 'vue-router';

// 告诉 TypeScript：哪些以 VITE_ 开头的环境变量是我们自己定义的
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** 为 true 时启用 MSW 拦截 /api，便于无后端并行开发 */
  readonly VITE_USE_MSW?: string;
  readonly VITE_APP_TITLE?: string;
  readonly VITE_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 路由 meta：titleKey 用于后台中英切换，title 保留中文作兜底
declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    titleKey?: string;
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
  }
}
