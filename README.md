<p align="center">
  <a href="https://vuejs.org/" target="_blank"><img src="https://img.shields.io/badge/Vue_3-4FC08D?style=flat-square&logo=vuedotframework&logoColor=fff" /></a>
  <a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=fff" /></a>
  <a href="https://vite.dev/" target="_blank"><img src="https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=fff" /></a>
  <a href="https://expressjs.com/" target="_blank"><img src="https://img.shields.io/badge/Express-000?style=flat-square&logo=express&logoColor=fff" /></a>
  <a href="https://www.postgresql.org/" target="_blank"><img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=fff" /></a>
  <img src="https://img.shields.io/badge/Element_Plus-409EFF?style=flat-square" />
  <a href="https://www.docker.com/" target="_blank"><img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=fff" /></a>
  <a href="https://vitest.dev/" target="_blank"><img src="https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=fff" /></a>
</p>

<h1 align="center">跨区域电商全栈演示系统</h1>

<p align="center">
  Vue 3 + Express + PostgreSQL 前后端分离电商项目
</p>

<p align="center">
  <a href="#快速开始">快速开始</a> •
  <a href="#功能特性">功能特性</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#项目结构">项目结构</a> •
  <a href="#演示账号">演示账号</a> •
  <a href="#文档">文档</a>
</p>

---

## 简介

本项目是一个基于 **Vue 3 + TypeScript + Vite** 的跨区域电商全栈演示系统，配套 **Express + PostgreSQL** 后端 API。系统采用前后端分离架构，支持国际化（中/英双语），涵盖完整的电商核心流程与后台管理功能。

- **前台端**：商品浏览、SKU 规格选择、购物车、模拟支付、订单管理、用户中心
- **后台端**（路径 `/admin`）：商品 / 分类 / 店铺 / 库存 / 订单 / 用户 / 角色管理、数据仪表盘

---

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 20+
- [PostgreSQL](https://www.postgresql.org/) 15+（或使用 Docker Compose 一键启动）

### 方式一：本地开发

```bash
# 1. 克隆项目并进入目录
cd aaabishe-dianshangxiangmu

# 2. 启动后端 API
cd server
npm install
npm start               # → http://localhost:3000

# 3. 启动前端（新终端）
cd ..
npm install
npm run dev             # → http://localhost:5173
```

> 首次启动后端时会自动创建数据表并写入种子数据。

### 方式二：Docker Compose（推荐）

```bash
docker compose up -d --build
```

- 前台页面：`http://localhost:8080`
- 后端 API：`http://localhost:3000`

> Docker 环境已内置 Nginx 反向代理，前端静态资源由 Nginx 托管，`/api` 请求自动转发到后端服务。

### 仅前端演示（无后端）

如需脱离后端运行前端，可复制 `.env.mock.example` 为 `.env.local`，或在前端环境变量中设置 `VITE_USE_MSW=true`，即可启用 MSW Mock 数据（当前覆盖 `GET /api/products`）。

---

## 功能特性

### 前台端（用户端）

| 功能 | 说明 |
|------|------|
| 🛍️ 商品浏览 | 商品列表、详情页、SKU 多规格选择、收藏、评价 |
| 🏪 店铺主页 | 按店铺筛选商品、店铺信息展示 |
| 🛒 购物车 | 增删改查、加入购物车飞入动画、数量调整 |
| 💳 结算与支付 | 模拟支付流程（余额 / 微信 / 支付宝） |
| 📦 订单中心 | 订单列表、状态追踪、物流查看 |
| 🧑 用户中心 | 个人信息、收货地址管理、我的收藏 |
| 🔐 身份认证 | 登录 / 注册 / 密码重置、路由守卫、Token 自动续期 |

### 后台端（管理端）

| 模块 | 能力 |
|------|------|
| 📊 仪表盘 | 销售趋势、热销商品、待办事项 |
| 📦 商品管理 | 商品的增删改查、上架下架状态控制 |
| 🏷️ 分类管理 | 分类增删改查、启用/禁用、双语名称 |
| 🏪 店铺管理 | 店铺 CRUD |
| 📋 库存管理 | 库存列表、低库存预警 |
| 📑 订单管理 | 订单列表、状态流转处理 |
| 👤 用户管理 | 用户 CRUD、角色分配 |
| 🔔 消息通知 | 系统消息、标记已读 |
| ⚙️ 个人设置 | 后台管理员资料修改 |

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Vue 3 + TypeScript | Composition API、类型安全 |
| 构建工具 | Vite 7 | 极速冷启动、HMR、代码分割 |
| 路由 | Vue Router 4 | History 模式、懒加载、全局导航守卫 |
| 状态管理 | Pinia 3 | 用户、购物车、语言、后台菜单状态 |
| UI 组件 | Element Plus | 渐进式引入，统一视觉风格 |
| HTTP 请求 | Axios | 拦截器、Token 自动刷新队列、请求去重、指数退避重试 |
| 国际化 | 自研轻量方案 | 10 个业务模块、zh-CN / en-US 双语 |
| 后端 | Express 4 + PostgreSQL | RESTful API、JWT + bcrypt、连接池 |
| 测试 | Vitest + Vue Test Utils | 工具函数 / Store / 组件单元测试 |
| Mock | MSW 2 | 可选 Mock，无后端时支持前端独立演示 |
| 代码规范 | ESLint + Prettier + Husky + lint-staged | 提交前自动格式化与检查 |
| CI/CD | GitHub Actions | Lint → 类型检查 → 测试 → 构建 |
| 部署 | Docker + Nginx | 多阶段构建、静态托管、API 反向代理 |

---

## 项目结构

```
.
├── src/                    # 前端源码
│   ├── api/                # Axios 封装与接口定义
│   ├── components/         # 公共组件与后台业务组件
│   ├── composables/        # Vue 组合式函数
│   ├── constants/          # 常量定义
│   ├── i18n/               # 国际化配置与翻译文件
│   ├── layouts/            # 页面布局组件
│   ├── mocks/              # MSW Mock 处理器
│   ├── router/             # 路由配置（含懒加载与权限守卫）
│   ├── stores/             # Pinia 状态管理
│   ├── styles/             # 全局样式
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数（格式化、校验等）
│   ├── views/              # 页面视图
│   │   ├── admin/          # 后台管理页面
│   │   └── ...             # 前台页面
│   └── __tests__/          # 单元测试
├── server/                 # Express 后端
│   ├── index.js            # 服务入口
│   ├── db.js               # 数据库连接与初始化
│   └── package.json
├── docs/                   # 项目文档
│   ├── API.md              # 接口文档
│   ├── DEPLOY.md           # 部署手册
│   └── 技术方案.md          # 技术架构说明
├── scripts/                # 辅助脚本（国际化检查等）
├── public/                 # 静态资源
├── docker-compose.yml      # Docker 编排配置
├── Dockerfile              # 前端镜像构建
├── nginx.conf              # Nginx 配置
└── package.json            # 前端依赖与脚本
```

---

## 演示账号

> 所有账号密码均为：`123456`

| 角色 | 账号 | 登录入口 |
|------|------|----------|
| 普通用户 | `user01` / `user02` | 前台「登录」 |
| 管理员 | `admin` / `operator` | 后台 `/admin` |

---

## 常用脚本

### 前端（根目录）

| 命令 | 作用 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 本地预览生产构建 |
| `npm run typecheck` | Vue / TS 类型检查 |
| `npm run test` | 交互式测试模式 |
| `npm run test:run` | 单次运行测试 |
| `npm run test:coverage` | 生成测试覆盖率报告 |
| `npm run lint` | ESLint 代码检查 |
| `npm run format` | Prettier 代码格式化 |
| `npm run i18n:check` | 扫描硬编码中文（国际化检查） |

### 后端（`server/` 目录）

| 命令 | 作用 |
|------|------|
| `npm start` | 启动 Express 服务 |

---

## 环境变量

### 前端

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `VITE_API_BASE_URL` | `/api` | Axios 请求基础路径 |
| `VITE_USE_MSW` | `false` | 是否启用 MSW Mock |

### 后端

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `DB_HOST` | `localhost` | 数据库主机地址 |
| `DB_PORT` | `5432` | 数据库端口 |
| `DB_NAME` | `ecommerce` | 数据库名称 |
| `DB_USER` | — | 数据库用户名 |
| `DB_PASSWORD` | — | 数据库密码 |
| `JWT_SECRET` | — | JWT 签名密钥 |
| `PORT` | `3000` | 服务监听端口 |

> 后端支持读取 `.env` 文件，开发时可参考 `server/.env.example` 创建本地配置。

---

## 文档

- [📘 API 接口文档](docs/API.md) — 完整接口列表与调用说明
- [🚀 部署手册](docs/DEPLOY.md) — 本地开发、Docker 部署、CI/CD、常见问题排查
- [🏗️ 技术方案](docs/技术方案.md) — 系统架构、技术选型、与工业级方案的对照

---

## CI/CD

本项目使用 [GitHub Actions](.github/workflows/ci.yml) 实现持续集成，每次推送自动执行：

```
Lint → Type Check → Unit Test → Build
```

本地可执行相同流程验证：

```bash
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
```

---

## 更新日志

详见 [CHANGELOG.md](CHANGELOG.md)。

---

## 开源协议

[MIT](LICENSE)
