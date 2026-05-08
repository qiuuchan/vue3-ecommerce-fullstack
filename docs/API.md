# HTTP 接口清单（Express 内存版）

本文档根据 [server/index.js](../server/index.js) 路由整理，**完整与语义以源码为准**。  
前端 axios `baseURL` 一般为 `/api`，与 Vite 代理或 Nginx 反代一致。

**图例**：需登录 = 路由使用 `requireLogin` 中间件。

---

## 认证 `/api/auth`

| 方法 | 路径 | 说明 | 需登录 |
|------|------|------|--------|
| POST | /api/auth/login | 登录，返回 token 与 profile | 否 |
| POST | /api/auth/logout | 登出 | 是 |

## 用户 `/api/user`

| 方法 | 路径 | 说明 | 需登录 |
|------|------|------|--------|
| GET | /api/user/profile | 当前用户资料 | 是 |
| GET | /api/user/center | 用户中心数据 | 是 |
| GET | /api/user/favorites | 收藏列表 | 是 |

## 店铺 `/api/shops`

| 方法 | 路径 | 说明 | 需登录 |
|------|------|------|--------|
| GET | /api/shops | 店铺列表 | 否 |
| GET | /api/shops/:id | 店铺详情 | 否 |
| GET | /api/shops/:id/products | 店铺下商品 | 否 |

## 商品 `/api/products`

| 方法 | 路径 | 说明 | 需登录 |
|------|------|------|--------|
| GET | /api/products | 上架商品列表 | 否 |
| GET | /api/products/:id | 商品详情 | 否 |
| POST | /api/products/:id/favorite | 收藏 | 是 |
| DELETE | /api/products/:id/favorite | 取消收藏 | 是 |
| POST | /api/products/:id/reviews | 提交/更新评价 | 是 |

## 购物车 `/api/cart`

| 方法 | 路径 | 说明 | 需登录 |
|------|------|------|--------|
| GET | /api/cart | 购物车列表 | 是 |
| POST | /api/cart/items | 添加行 | 是 |
| PUT | /api/cart/items/:id | 更新数量 | 是 |
| DELETE | /api/cart/items/:id | 删除行 | 是 |

## 管理端 `/api/admin/*`（均需登录）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin/dashboard/overview | 仪表盘概览 |
| GET/POST | /api/admin/products | 商品列表 / 新建 |
| GET/PUT/DELETE | /api/admin/products/:id | 商品详情 / 更新 / 删除 |
| GET/POST | /api/admin/categories | 分类 |
| PUT/DELETE | /api/admin/categories/:id | 分类更新 / 删除 |
| GET | /api/admin/inventory | 库存列表 |
| GET | /api/admin/inventory/warnings | 库存预警 |
| PUT | /api/admin/inventory/:productId | 更新库存 |
| GET | /api/admin/orders | 订单列表 |
| GET | /api/admin/orders/:id | 订单详情 |
| PUT | /api/admin/orders/:id/status | 更新订单状态 |
| GET/POST | /api/admin/users | 用户列表 / 新建 |
| PUT/DELETE | /api/admin/users/:id | 用户更新 / 删除 |
| GET | /api/admin/roles | 角色列表 |
| GET | /api/admin/messages | 消息列表 |
| PUT | /api/admin/messages/:id/read | 标记已读 |
| GET/PUT | /api/admin/profile | 后台个人资料 |
| GET/POST | /api/admin/shops | 店铺列表 / 新建 |
| PUT/DELETE | /api/admin/shops/:id | 店铺更新 / 删除 |

---

## 前端 Mock（可选）

当 `VITE_USE_MSW=true` 时，[src/mocks/handlers.ts](../src/mocks/handlers.ts) 会拦截 **`GET /api/products`**，其余请求仍可按 `bypass` 规则走真实后端。
