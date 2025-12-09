# 构建阶段
# 注意：此Dockerfile应从项目根目录运行：docker build -f apps/web-main/Dockerfile .
FROM node:22.14.0-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制根目录配置文件
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# 复制packages目录
COPY packages/ packages/

# 复制web-main应用
COPY apps/web-main/ apps/web-main/

# 安装pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install

# 构建web-main应用
RUN pnpm --filter web-main run build

# 生产阶段
FROM nginx:alpine

# 设置时区
RUN apk --no-cache add tzdata && \
  ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
  echo "Asia/Shanghai" > /etc/timezone

# 复制构建产物到nginx
COPY --from=builder /app/apps/web-main/dist /usr/share/nginx/html

# 复制nginx配置（使用正确的路径）
COPY --from=builder /app/apps/web-main/nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 8091

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]