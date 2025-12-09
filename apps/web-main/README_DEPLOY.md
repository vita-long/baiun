# Docker容器化与自动化部署指南

本文档详细介绍了web-main应用的Docker容器化配置和自动化部署流程。

## 目录结构

```
apps/web-main/
├── Dockerfile             # Docker构建配置文件
├── nginx.conf             # Nginx服务器配置
├── build-and-deploy.sh    # 本地构建与部署脚本
└── start-container.sh     # 服务器端容器启动脚本
```

## 1. 环境要求

### 本地环境
- Docker
- SSH客户端
- 能够访问阿里云服务器的网络环境
- 构建环境使用Node.js 22.14.0

### 服务器环境
- Linux系统（推荐Ubuntu/CentOS）
- Docker
- 开放对应端口的防火墙设置

## 2. 配置说明

### 2.1 服务器信息配置

编辑`build-and-deploy.sh`文件，设置阿里云服务器信息：

```bash
# 阿里云服务器配置（需要替换为实际配置）
ALIYUN_SERVER_IP="your-server-ip"          # 服务器IP地址
ALIYUN_SERVER_USER="your-username"         # 服务器用户名
ALIYUN_SERVER_PORT="22"                    # SSH端口（默认22）
ALIYUN_DOCKER_PORT="80"                    # 应用对外端口
ALIYUN_DEPLOY_DIR="/opt/vita-deploy"       # 服务器部署目录
```

### 2.2 Dockerfile配置详解

Dockerfile采用多阶段构建策略：

1. **构建阶段**（node:22.14.0-alpine）：
   - 安装pnpm包管理工具
   - 安装monorepo依赖
   - 执行应用构建命令

2. **生产阶段**（nginx:alpine）：
   - 设置上海时区
   - 复制构建产物到Nginx目录
   - 配置Nginx服务

### 2.3 Nginx配置详解

nginx.conf包含以下关键配置：
- 静态资源服务与gzip压缩
- React SPA应用的路由重定向（支持页面刷新）
- 静态资源缓存策略（7天过期）
- 错误页面处理

## 3. 部署流程

### 3.1 首次部署

1. 确保本地和服务器都已安装Docker
2. 配置`build-and-deploy.sh`中的服务器信息
3. 添加脚本执行权限：
   ```bash
   chmod +x build-and-deploy.sh start-container.sh
   ```
4. 执行部署脚本：
   ```bash
   ./build-and-deploy.sh
   ```

### 3.2 部署脚本执行流程

1. **环境检查**：检查Docker、SSH等命令是否可用
2. **镜像构建**：在本地构建Docker镜像
3. **镜像保存**：将镜像保存为tar文件
4. **文件上传**：将镜像文件和启动脚本上传到服务器
5. **远程部署**：在服务器上执行启动脚本
6. **本地清理**：清理本地临时文件

### 3.3 服务器启动流程

服务器上的`start-container.sh`执行以下操作：
1. 停止并移除旧容器
2. 加载新的Docker镜像
3. 启动新容器
4. 清理旧镜像和临时文件
5. 检查并显示容器运行状态

## 4. 访问应用

部署成功后，可以通过以下地址访问应用：
- HTTP：`http://服务器IP:端口号`
  - 例如：`http://192.168.1.100:80`

## 5. 常见问题与排查

### 5.1 部署失败

1. **SSH连接失败**
   - 检查服务器IP、用户名和端口是否正确
   - 确保本地可以SSH连接到服务器
   - 检查服务器防火墙设置

2. **Docker构建失败**
   - 检查本地Docker是否正常运行
   - 检查网络连接是否正常（特别是拉取基础镜像时）
   - 查看详细错误日志以定位问题

3. **容器启动失败**
   - 检查服务器Docker是否正常运行
   - 查看容器日志：`docker logs 容器名称`
   - 检查端口是否被占用

### 5.2 应用访问问题

1. **页面显示404**
   - 检查Nginx配置是否正确
   - 验证应用构建产物是否完整

2. **页面刷新后显示404**
   - 确认Nginx配置中的SPA路由重定向设置是否正确
   - 检查`try_files $uri $uri/ /index.html;`配置是否存在

## 6. 扩展与优化

### 6.1 HTTPS配置

要启用HTTPS，需要修改Nginx配置并添加SSL证书：

1. 准备SSL证书文件
2. 修改`nginx.conf`，添加HTTPS服务器配置
3. 修改`start-container.sh`，映射证书文件到容器内

### 6.2 自定义环境变量

如需为应用添加环境变量，可在`Dockerfile`中使用`ENV`指令，或在`start-container.sh`的`docker run`命令中添加`-e`参数。

### 6.3 多环境部署

可以通过复制并修改脚本，为不同环境（开发、测试、生产）创建独立的部署配置。

## 7. 性能优化建议

1. **镜像大小优化**
   - 使用Alpine基础镜像
   - 合理使用Docker层缓存
   - 清理构建过程中的临时文件

2. **Nginx优化**
   - 根据实际需求调整缓存策略
   - 优化gzip压缩级别
   - 配置连接数和超时时间

## 8. 版本管理

每次部署会自动使用时间戳作为镜像标签，便于版本管理和回滚。如需回滚到特定版本：

1. 在服务器上查看所有镜像：`docker images`
2. 选择需要回滚的镜像版本
3. 手动运行`start-container.sh`并指定对应镜像标签

## 9. 安全注意事项

1. 定期更新Docker基础镜像
2. 限制容器的资源使用
3. 配置适当的网络隔离
4. 不要在镜像中包含敏感信息

## 10. 监控与维护

### 10.1 容器监控

可以使用Docker自带的命令监控容器状态：
- 查看容器运行状态：`docker ps`
- 查看容器日志：`docker logs -f 容器名称`
- 查看容器资源使用：`docker stats 容器名称`

### 10.2 日志管理

应用日志默认输出到容器标准输出，可以通过以下方式管理：
- 使用`docker logs`命令查看
- 配置Docker日志驱动，将日志输出到外部系统

---

通过以上配置和流程，可以实现web-main应用的高效、可靠的容器化部署，大大简化运维工作并提高部署一致性。