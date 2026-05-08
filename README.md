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

# vue3-ecommerce-fullstack

> 跨区域电商全栈演示系统 · Vue 3 + Express + PostgreSQL

前台提供商品浏览、SKU 规格选择、购物车、支付模拟；后台提供商品/分类/店铺/库存/订单/用户/角色管理。支持中英文双语切换。

---

## Quick Start

**Prerequisites:** Node.js 20+, PostgreSQL 15+

```bash
# 1. Create database
createdb ecommerce

# 2. Start backend API
cd server
npm install && npm start     # → http://localhost:3000

# 3. Start frontend (new terminal)
cd ..
npm install && npm run dev   # → http://localhost:5173
```

Tables and seed data are created automatically on first startup.

---

## Features

### Frontend (Customer)

| Feature | Description |
|---------|-------------|
| Product browsing | List, detail with SKU selector, reviews, favorites |
| Shop page | Per-shop product display |
| Cart | CRUD with flying animation on add |
| Checkout & Payment | Simulated payment (balance / WeChat / Alipay) |
| User center | Orders, addresses, profile |
| Auth | Login / Register / Password reset, route guards |

### Backend (Admin `/admin`)

| Module | Capabilities |
|--------|-------------|
| Dashboard | Sales trends, hot products, todo list |
| Products | CRUD + status management |
| Categories | Enable/disable, bilingual names |
| Shops | CRUD |
| Inventory | Stock list, low-stock warnings |
| Orders | Status flow management |
| Users | CRUD + role assignment |
| Roles / Messages / Profile | Permission display, mark-as-read |

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Vue 3, TypeScript, Vite 7, Vue Router, Pinia, Element Plus |
| HTTP | Axios — interceptors, auto token refresh queue, request dedup, exponential backoff retry |
| i18n | Custom lightweight solution, 10 business modules, zh-CN / en-US |
| Backend | Express 4, PostgreSQL, JWT + bcrypt, connection pool |
| CI | GitHub Actions, Husky + lint-staged |
| Deploy | Docker multi-stage build, Docker Compose, Nginx |
| Test | Vitest, Vue Test Utils, MSW (mock) |

---

## Project Structure

```
.
├─ src/           Frontend (api / components / stores / views / router / i18n …)
├─ server/        Express backend
├─ docs/          API reference & deployment guide
├─ docker-compose.yml
├─ Dockerfile
└─ nginx.conf
```

---

## Demo Accounts

All passwords: `123456`

| Role | Username | Login tab |
|------|----------|-----------|
| Customer | `user01` / `user02` | Customer |
| Admin | `admin` / `operator` | Admin |

---

## Scripts

### Frontend (root)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + build |
| `npm run typecheck` | Vue/TS type check |
| `npm run test:run` | Run tests |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

### Backend (`server/`)

| Command | Purpose |
|---------|---------|
| `npm start` | Start Express server |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `/api` | Axios base URL |
| `VITE_USE_MSW` | `false` | Enable MSW mock |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `ecommerce` | Database name |
| `JWT_SECRET` | (dev fallback) | JWT signing secret |

---

## Documentation

- [API Reference](docs/API.md) — Full endpoint list
- [Deployment Guide](docs/DEPLOY.md) — Local, Docker, CI, troubleshooting

---

## License

MIT
