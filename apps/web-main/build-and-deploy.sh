#!/bin/bash

# 脚本名称: build-and-deploy.sh
# 功能: 构建Docker镜像并部署到阿里云服务器

# 颜色输出定义
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # No Color

echo -e "${GREEN}===== Web应用构建与部署脚本 =====${NC}"

# 配置变量
IMAGE_NAME="vita-web-main"
IMAGE_TAG=$(date +"%Y%m%d%H%M%S")
FULL_IMAGE_NAME="$IMAGE_NAME:$IMAGE_TAG"
DOCKERFILE_PATH="./Dockerfile"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 阿里云服务器配置（需要用户替换为实际配置）
ALIYUN_SERVER_IP="47.93.63.238"
ALIYUN_SERVER_USER="root"
ALIYUN_SERVER_PORT="22"
ALIYUN_DOCKER_PORT="8091"
ALIYUN_DEPLOY_DIR="/www/wwwroot"

# 检查必要的命令是否存在
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}错误: $1 命令未找到，请先安装${NC}"
    exit 1
  fi
}

# 检查Docker是否运行
check_docker_running() {
  if ! docker info &> /dev/null; then
    echo -e "${RED}错误: Docker服务未运行，请先启动Docker${NC}"
    exit 1
  fi
}

# 验证阿里云服务器配置
validate_config() {
  # 检查是否仍使用默认占位符
  if [ "$ALIYUN_SERVER_IP" = "your-server-ip" ]; then
    echo -e "${YELLOW}警告: 请先编辑脚本，设置正确的阿里云服务器IP地址${NC}"
    echo -e "${YELLOW}警告: 编辑 $SCRIPT_DIR/build-and-deploy.sh${NC}"
    exit 1
  fi
}

# 构建Docker镜像
build_image() {
  echo -e "${GREEN}[1/4] 开始构建Docker镜像...${NC}"
  
  # 获取项目根目录（vita目录）
  PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
  
  # 切换到项目根目录执行构建
  cd "$PROJECT_ROOT"
  
  # 执行Docker构建，从根目录指定Dockerfile路径
  if docker build -t "$FULL_IMAGE_NAME" -f "apps/web-main/Dockerfile" .; then
    echo -e "${GREEN}✓ Docker镜像构建成功: $FULL_IMAGE_NAME${NC}"
    
    # 标记为latest
    docker tag "$FULL_IMAGE_NAME" "$IMAGE_NAME:latest"
    echo -e "${GREEN}✓ 镜像标记为latest${NC}"
    return 0
  else
    echo -e "${RED}✗ Docker镜像构建失败${NC}"
    return 1
  fi
}

# 保存Docker镜像
save_image() {
  echo -e "${GREEN}[2/4] 保存Docker镜像...${NC}"
  
  IMAGE_TAR="${IMAGE_NAME}_${IMAGE_TAG}.tar"
  
  if docker save -o "$IMAGE_TAR" "$FULL_IMAGE_NAME"; then
    echo -e "${GREEN}✓ Docker镜像保存成功: $IMAGE_TAR${NC}"
    return 0
  else
    echo -e "${RED}✗ Docker镜像保存失败${NC}"
    return 1
  fi
}

# 部署到阿里云服务器
deploy_to_server() {
  echo -e "${GREEN}[3/4] 部署到阿里云服务器...${NC}"
  
  # 确保我们知道启动脚本的正确位置
  START_SCRIPT_PATH="$SCRIPT_DIR/start-container.sh"
  
  # 创建远程部署目录
  ssh -p "$ALIYUN_SERVER_PORT" "$ALIYUN_SERVER_USER@$ALIYUN_SERVER_IP" "mkdir -p $ALIYUN_DEPLOY_DIR"
  
  # 上传镜像文件
  scp -P "$ALIYUN_SERVER_PORT" "${IMAGE_NAME}_${IMAGE_TAG}.tar" "$ALIYUN_SERVER_USER@$ALIYUN_SERVER_IP:$ALIYUN_DEPLOY_DIR/"
  
  # 上传启动脚本，使用正确的路径
  scp -P "$ALIYUN_SERVER_PORT" "$START_SCRIPT_PATH" "$ALIYUN_SERVER_USER@$ALIYUN_SERVER_IP:$ALIYUN_DEPLOY_DIR/"
  
  # 在远程服务器上加载镜像并启动容器
  ssh -p "$ALIYUN_SERVER_PORT" "$ALIYUN_SERVER_USER@$ALIYUN_SERVER_IP" "
    cd $ALIYUN_DEPLOY_DIR
    chmod +x start-container.sh
    ./start-container.sh $IMAGE_NAME $IMAGE_TAG $ALIYUN_DOCKER_PORT
  "
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 成功部署到阿里云服务器${NC}"
    return 0
  else
    echo -e "${RED}✗ 部署到阿里云服务器失败${NC}"
    return 1
  fi
}

# 清理本地镜像文件
cleanup() {
  echo -e "${GREEN}[4/4] 清理本地文件...${NC}"
  
  # 删除tar文件
  if [ -f "${IMAGE_NAME}_${IMAGE_TAG}.tar" ]; then
    rm "${IMAGE_NAME}_${IMAGE_TAG}.tar"
    echo -e "${GREEN}✓ 清理本地镜像文件${NC}"
  fi
  
  # 可选：删除本地镜像
  # docker rmi "$FULL_IMAGE_NAME" "$IMAGE_NAME:latest"
}

# 主执行流程
echo -e "${YELLOW}正在检查环境...${NC}"
check_command docker
check_command ssh
check_command scp
check_docker_running
validate_config

echo -e "${YELLOW}开始构建和部署流程...${NC}"
build_image && \
save_image && \
deploy_to_server && \
cleanup

if [ $? -eq 0 ]; then
  echo -e "${GREEN}\n🎉 构建与部署流程已成功完成！${NC}"
  echo -e "${GREEN}应用可通过 http://$ALIYUN_SERVER_IP:$ALIYUN_DOCKER_PORT 访问${NC}"
else
  echo -e "${RED}\n❌ 构建与部署流程失败${NC}"
  exit 1
fi