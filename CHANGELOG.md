# Changelog

所有 notable 变更都记录在本文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

---

## [Unreleased]

### Added
- 后端数据国际化：商品/店铺/分类增加 `nameEn`/`descriptionEn` 字段，根据 `X-App-Language` 返回对应语言
- 前端 i18n 模块化：拆分 monolithic `messages.ts` 为 10 个模块 per 语言
- 全局错误边界 `ErrorBoundary.vue`：页面异常不白屏
- Web Vitals 性能采集：LCP/FID/CLS/FCP/TTFB
- 前端错误上报服务：自动捕获 JS 异常、Promise 拒绝、资源加载失败
- 骨架屏组件 `SkeletonLoader.vue`
- axios 指数退避重试 + 请求去重机制
- Nginx 安全头：X-Frame-Options、X-Content-Type-Options、X-XSS-Protection 等
- 自定义 ESLint 规则 `no-chinese-text`：防止未国际化的中文文本
- `i18n:check` 扫描脚本：检测硬编码中文
- 单元测试覆盖提升：从 5 个用例增加到 38 个用例

### Fixed
- 英文状态下首页 "今日特惠" 按钮空白（`home.btnDeals` 缺失英文值）
- 切换语言后商品名仍为英文（`Accept-Language` 被浏览器覆盖，改用 `X-App-Language`）
- `.env.production` 敏感信息泄露风险（加入 `.gitignore`）

---

## [0.1.0] - 2026-04-03

### Added
- 跨区域电商演示系统初始版本
- 用户端：首页、商品列表、商品详情、店铺页、收藏、购物车、订单、用户中心
- 管理端：仪表盘、商品管理、分类管理、店铺管理、库存、订单、用户/角色管理
- 国际化：zh-CN / en-US 双语切换
- CI/CD：GitHub Actions（lint / typecheck / test / build）
- Docker + Nginx 部署方案
