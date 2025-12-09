#!/bin/bash

# 脚本名称: start-container.sh
# 功能: 在阿里云服务器上加载Docker镜像并启动容器

# 颜色输出定义
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

echo -e "${GREEN}===== 容器启动脚本 =====${NC}"

# 检查参数
if [ $# -ne 3 ]; then
  echo -e "${RED}错误: 参数不足${NC}"
  echo -e "用法: ./start-container.sh <镜像名称> <镜像标签> <端口>"
  exit 1
fi

# 配置变量
IMAGE_NAME=$1
IMAGE_TAG=$2
SERVER_PORT=$3
FULL_IMAGE_NAME="$IMAGE_NAME:$IMAGE_TAG"
CONTAINER_NAME="$IMAGE_NAME-container"
CURRENT_DIR="$(pwd)"
IMAGE_TAR="${IMAGE_NAME}_${IMAGE_TAG}.tar"

# 检查Docker是否运行
check_docker_running() {
  if ! docker info &> /dev/null; then
    echo -e "${RED}错误: Docker服务未运行，请先启动Docker${NC}"
    exit 1
  fi
}

# 停止并移除旧容器
stop_old_container() {
  echo -e "${GREEN}[1/4] 检查并停止旧容器...${NC}"
  
  if docker ps -a | grep -q "$CONTAINER_NAME"; then
    echo -e "${YELLOW}发现旧容器，正在停止...${NC}"
    docker stop "$CONTAINER_NAME" > /dev/null 2>&1
    docker rm "$CONTAINER_NAME" > /dev/null 2>&1
    echo -e "${GREEN}✓ 旧容器已停止并移除${NC}"
  else
    echo -e "${GREEN}✓ 没有发现旧容器${NC}"
  fi
}

# 加载新镜像
load_new_image() {
  echo -e "${GREEN}[2/4] 加载新的Docker镜像...${NC}"
  
  if [ -f "$IMAGE_TAR" ]; then
    if docker load -i "$IMAGE_TAR"; then
      echo -e "${GREEN}✓ 镜像加载成功: $FULL_IMAGE_NAME${NC}"
      return 0
    else
      echo -e "${RED}✗ 镜像加载失败${NC}"
      return 1
    fi
  else
    echo -e "${RED}✗ 未找到镜像文件: $IMAGE_TAR${NC}"
    return 1
  fi
}

# 启动新容器
start_new_container() {
  echo -e "${GREEN}[3/4] 启动新容器...${NC}"
  
  if docker run -d \
    --name "$CONTAINER_NAME" \
    -p "8091:8091" \
    --restart=always \
    "$FULL_IMAGE_NAME"; then
    
    echo -e "${GREEN}✓ 容器启动成功: $CONTAINER_NAME${NC}"
    return 0
  else
    echo -e "${RED}✗ 容器启动失败${NC}"
    return 1
  fi
}

# 清理旧镜像
cleanup_old_images() {
  echo -e "${GREEN}[4/4] 清理旧镜像...${NC}"
  
  # 获取当前使用的镜像ID
  CURRENT_IMAGE_ID=$(docker images -q "$FULL_IMAGE_NAME")
  
  if [ -n "$CURRENT_IMAGE_ID" ]; then
    # 获取所有同名但不同标签的旧镜像（排除当前运行的镜像）
    OLD_IMAGES=$(docker images -q "$IMAGE_NAME" | grep -v "$CURRENT_IMAGE_ID")
    
    if [ -n "$OLD_IMAGES" ]; then
      echo -e "${YELLOW}正在清理旧镜像...${NC}"
      echo "$OLD_IMAGES" | xargs -I {} docker rmi {} > /dev/null 2>&1
      echo -e "${GREEN}✓ 旧镜像清理完成${NC}"
    else
      echo -e "${GREEN}✓ 没有需要清理的旧镜像${NC}"
    fi
  fi
  
  # 删除上传的镜像tar文件
  if [ -f "$IMAGE_TAR" ]; then
    rm "$IMAGE_TAR"
    echo -e "${GREEN}✓ 删除上传的镜像文件${NC}"
  fi
}

# 检查容器状态
check_container_status() {
  echo -e "${GREEN}\n正在检查容器状态...${NC}"
  
  if docker ps | grep -q "$CONTAINER_NAME"; then
    CONTAINER_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$CONTAINER_NAME")
    echo -e "${GREEN}✓ 容器运行状态: 正常${NC}"
    echo -e "${GREEN}✓ 容器ID: $(docker ps -qf name="$CONTAINER_NAME")${NC}"
    echo -e "${GREEN}✓ 容器IP: $CONTAINER_IP${NC}"
    echo -e "${GREEN}✓ 外部访问地址: http://$(hostname -I | awk '{print $1}'):$SERVER_PORT${NC}"
    return 0
  else
    echo -e "${RED}✗ 容器未正常运行${NC}"
    return 1
  fi
}

# 主执行流程
echo -e "${YELLOW}正在检查环境...${NC}"
check_docker_running

echo -e "${YELLOW}开始容器部署流程...${NC}"
stop_old_container && \
load_new_image && \
start_new_container && \
cleanup_old_images && \
check_container_status

if [ $? -eq 0 ]; then
  echo -e "${GREEN}\n🎉 容器部署成功完成！${NC}"
  exit 0
else
  echo -e "${RED}\n❌ 容器部署失败${NC}"
  exit 1
fi