# 最简 Node 镜像跑 Express（与项目根 docker-compose 里的 api 服务配套）
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "index.js"]
