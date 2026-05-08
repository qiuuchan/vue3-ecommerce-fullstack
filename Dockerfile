# 第一阶段：用 Node 安装依赖并执行 Vite 打包，得到 dist 静态文件
FROM node:20-alpine AS build

WORKDIR /app

# 只先拷贝依赖清单，利用 Docker 层缓存：没改 package.json 就不用重复 npm ci
COPY package.json package-lock.json* ./

# 安装依赖（没有 lock 会先由 npm ci 失败吗？有 package-lock 用 ci；否则用 npm install）
RUN npm ci

# 再拷贝源码并打包
COPY . .
RUN npm run build

# 第二阶段：用 Nginx 托管 dist（体积小、适合线上）
FROM nginx:1.27-alpine

# 覆盖默认站点配置：SPA 路由 + /api 反代（见 nginx.conf）
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
