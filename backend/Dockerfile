FROM node:22.19.0-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制Prisma schema
COPY prisma ./prisma/

# 生成Prisma Client
RUN npx prisma generate

# 复制源代码
COPY src ./src

# 创建数据目录
RUN mkdir -p /app/data

EXPOSE 3000

# 启动前运行迁移
CMD npx prisma migrate deploy && node src/server.js
