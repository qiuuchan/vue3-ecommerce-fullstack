# 部署手册

## 一、本地开发（Windows CMD）

### 1. 前端

```bat
D:
cd \aaabishe-dianshangxiangmu
npm install
npm run dev
```

浏览器访问 `http://localhost:5173`（以终端输出为准）。

### 2. 后端 API（须同时运行，否则 `/api` 失败）

```bat
D:
cd \aaabishe-dianshangxiangmu\server
npm install
npm start
```

默认 `http://localhost:3000`。Vite 将 `/api` 代理到该地址，见根目录 `vite.config.ts`。

### 3. 仅前端演示（无后端）

复制根目录 `.env.mock.example` 内容为 `.env.local`，或在本机 `.env.development` 中设置 `VITE_USE_MSW=true`，并确保 `public/mockServiceWorker.js` 存在。  
当前 Mock 仅覆盖 **`GET /api/products`**，其它接口仍会尝试请求真实后端。

---

## 二、Docker Compose

在项目根目录：

```bat
D:
cd \aaabishe-dianshangxiangmu
docker compose up -d --build
```

- 前端页面：`http://localhost:8080`（Nginx 托管 `dist`）
- API：`http://localhost:3000`

Nginx 将页面内 `/api` 反代到 `api` 服务，配置见根目录 [nginx.conf](../nginx.conf)。

---

## 三、常见问题

| 现象 | 处理 |
|------|------|
| 登录/列表报网络错误 | 确认 `server` 已启动；或检查是否误开 MSW 导致仅部分接口可用 |
| 5173 端口占用 | 修改 `vite.config.ts` 的 `server.port` 或结束占用进程 |
| 3000 端口占用 | 修改 `server` 环境变量 `PORT` 并同步前端代理 target |
| 生产跨域 | 后端配置 CORS；或同源部署由 Nginx 反代 `/api` |

---

## 四、CI 构建

根目录执行（与 GitHub Actions 一致）：

```bat
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
```

若仓库无 `package-lock.json` 更新，可暂用 `npm install` 代替 `npm ci`（不推荐长期如此）。
