# 🎮 1024游戏 - Apple风格版

[![CI/CD](https://github.com/snakeliwei/cc-1024-game/actions/workflows/ci.yml/badge.svg)](https://github.com/snakeliwei/cc-1024-game/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个现代化的1024游戏实现，采用Apple官网的简洁优雅设计风格，支持游客转注册、排行榜、分享等完整功能。

## ✨ 特性

### 游戏功能
- 🎯 经典1024游戏玩法（4x4网格）
- ⌨️ 支持键盘（方向键/WASD）和触摸操作
- ↶ 撤销功能（最多10步）
- 📊 实时分数和统计
- 🏆 最高分记录

### 用户系统
- 👤 **游客模式**：无需注册即可开始游戏
- 📧 **邮箱注册**：游客可随时升级为正式用户
- 🔒 安全的JWT认证
- 📱 多设备登录支持

### 社交功能
- 🏅 全球排行榜（今日/本周/全部）
- 📤 分享游戏成绩（图片/文本）
- 💾 个人战绩历史

### 设计特点
- 🎨 Apple风格UI设计
- 🌓 深色/浅色主题切换
- ✨ 流畅的动画效果
- 📱 完美的响应式设计
- 🪟 毛玻璃效果

## 🏗️ 技术栈

### 前端
- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP客户端**: Axios
- **截图**: html2canvas

### 后端
- **框架**: Fastify
- **数据库**: SQLite + Prisma ORM
- **缓存**: Redis
- **认证**: JWT
- **邮件**: Nodemailer

### 部署
- **容器化**: Docker + Docker Compose
- **Web服务器**: Nginx (前端)

## 📁 项目结构

```
1024-game/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/       # Vue组件
│   │   ├── views/            # 页面
│   │   ├── stores/           # Pinia状态管理
│   │   ├── services/         # API服务
│   │   ├── utils/            # 工具函数
│   │   └── router/           # 路由配置
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── plugins/          # Fastify插件
│   │   ├── routes/           # API路由
│   │   ├── services/         # 业务服务
│   │   └── app.js            # 应用入口
│   ├── prisma/
│   │   └── schema.prisma     # 数据库Schema
│   └── Dockerfile
│
└── docker-compose.yml        # Docker编排配置
```

## 🚀 快速开始

### 前置要求
- Node.js 18+
- npm 或 yarn
- (可选) Docker 和 Docker Compose

### 本地开发

#### 1. 克隆项目
```bash
git clone <your-repo-url>
cd 1024-game
```

#### 2. 启动后端

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，配置邮件等参数

# 生成Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 启动开发服务器
npm run dev
```

后端将运行在 `http://localhost:3000`

#### 3. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 `http://localhost:5173`

#### 4. 访问应用

打开浏览器访问 `http://localhost:5173`

### 使用Docker部署

#### 方式一：使用预构建镜像（推荐）

```bash
# 1. 创建环境变量文件
cat > .env << EOF
JWT_SECRET=your-random-secret-key-here
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASS=your_mailtrap_pass
FRONTEND_URL=http://localhost
EOF

# 2. 拉取最新镜像
docker-compose pull

# 3. 启动所有服务
docker-compose up -d

# 4. 查看日志
docker-compose logs -f
```

#### 方式二：本地构建

```bash
# 使用开发配置文件
docker-compose -f docker-compose.dev.yml up -d --build
```

#### 访问应用

- 前端：http://localhost
- 后端API：http://localhost:3000

#### 停止服务

```bash
docker-compose down
```

## 🚀 CI/CD部署

本项目使用GitHub Actions自动构建和发布Docker镜像到GitHub Container Registry。

### 自动构建流程

每次推送到`main`分支时，会自动：
1. ✅ 运行前端和后端的构建测试
2. ✅ 生成Prisma Client
3. ✅ 构建Docker镜像
4. ✅ 推送到GitHub Container Registry

### 使用CI构建的镜像

```bash
# 拉取最新镜像
docker pull ghcr.io/snakeliwei/1024-game-frontend:latest
docker pull ghcr.io/snakeliwei/1024-game-backend:latest

# 使用docker-compose启动
docker-compose up -d
```

### 镜像仓库

- Frontend: `ghcr.io/snakeliwei/1024-game-frontend:latest`
- Backend: `ghcr.io/snakeliwei/1024-game-backend:latest`

## 🔧 环境变量配置

### 后端 (.env)

```bash
# 环境
NODE_ENV=development

# 服务端口
PORT=3000

# 数据库
DATABASE_URL="file:./dev.db"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT密钥（生产环境务必修改！）
JWT_SECRET=your-super-secret-jwt-key

# 邮件配置
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_user
EMAIL_PASS=your_mailtrap_pass
EMAIL_FROM=noreply@1024game.com

# 前端URL
FRONTEND_URL=http://localhost:5173

# 日志级别
LOG_LEVEL=info
```

### 前端 (.env)

```bash
VITE_API_URL=http://localhost:3000/api
```

## 📮 邮件配置

### 开发环境 - 使用Mailtrap

1. 注册 [Mailtrap](https://mailtrap.io/) 账号
2. 获取SMTP凭据
3. 更新.env文件中的邮件配置

### 生产环境 - 使用真实SMTP

支持任何SMTP服务（QQ邮箱、Gmail、SendGrid等）：

```bash
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=465
EMAIL_USER=your@qq.com
EMAIL_PASS=your_auth_code
```

## 🎮 游戏玩法

1. 使用方向键（↑↓←→）或WASD移动方块
2. 在触摸设备上滑动屏幕
3. 相同数字的方块相撞时会合并
4. 达到1024即为胜利（可继续挑战2048）
5. 无法移动时游戏结束

## 🔐 安全建议

### 生产环境部署前

1. **修改JWT密钥**
   ```bash
   # 生成随机密钥
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **启用HTTPS**
   - 使用Let's Encrypt获取SSL证书
   - 配置Nginx反向代理

3. **限制CORS**
   ```javascript
   // backend/src/app.js
   origin: 'https://your-domain.com'
   ```

4. **数据库备份**
   ```bash
   # 定期备份SQLite数据库
   cp backend/data/prod.db backend/data/backup_$(date +%Y%m%d).db
   ```

## 📊 API文档

### 认证接口

```
POST   /api/auth/guest              创建游客账号
POST   /api/auth/register           游客升级为正式用户
POST   /api/auth/login              登录
GET    /api/auth/verify-email/:token 验证邮箱
```

### 用户接口

```
GET    /api/user/profile            获取用户信息
PUT    /api/user/profile            更新用户信息
GET    /api/user/stats              获取个人统计
```

### 分数接口

```
POST   /api/scores                  提交分数
GET    /api/scores/me               获取个人分数历史
```

### 排行榜接口

```
GET    /api/leaderboard             获取排行榜
GET    /api/leaderboard/rank/:score 查询分数排名
```

## 🛠️ 开发工具

### Prisma Studio (数据库管理)

```bash
cd backend
npm run prisma:studio
```

访问 `http://localhost:5555` 可视化管理数据库

### 数据库迁移

```bash
# 创建新迁移
npx prisma migrate dev --name <migration_name>

# 重置数据库
npx prisma migrate reset
```

## 🐛 故障排查

### 前端无法连接后端

检查前端.env文件中的API_URL配置

### 邮件发送失败

检查后端.env文件中的邮件配置，确保SMTP凭据正确

### Redis连接失败

后端会自动降级，不影响核心功能，但排行榜无缓存

### Docker容器无法启动

```bash
# 查看日志
docker-compose logs

# 重新构建
docker-compose build --no-cache
docker-compose up
```

## 📝 许可证

MIT License

## 👥 贡献

欢迎提交Issue和Pull Request！

## 🙏 致谢

- 灵感来源于经典的2048游戏
- UI设计参考Apple官网
- 使用了优秀的开源项目

---

**Enjoy the game! 🎮**
