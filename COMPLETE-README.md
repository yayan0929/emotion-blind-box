# 大学生情绪盲盒交换站 - 完整版

## 项目简介

大学生情绪盲盒交换站是一个面向大学生群体的匿名情绪互助平台，允许用户创建情绪盲盒、随机抽取他人盲盒并进行回复，营造一个温暖、互助的情绪交流环境。

## 核心功能

### 用户端功能
- ✅ **用户注册/登录** - 支持手机号和邮箱注册，密码和验证码登录
- ✅ **情绪盲盒创建** - 支持文字和图片，可设置匿名或实名，可控制公开度和回复权限
- ✅ **盲盒随机抽取** - 随机分配未查看过的盲盒，避免重复
- ✅ **回复互动** - 对盲盒进行匿名回复，支持点赞功能
- ✅ **个人中心** - 查看自己的盲盒、回复和点赞记录
- ✅ **图片上传** - 支持多图片上传，自动压缩和格式检查
- ✅ **敏感词过滤** - 自动检测并处理敏感内容

### 管理员功能
- ✅ **仪表板** - 系统数据统计、趋势分析
- ✅ **用户管理** - 查看所有用户，支持冻结/解冻操作
- ✅ **盲盒管理** - 查看所有盲盒，支持精选、下架、删除操作
- ✅ **回复管理** - 查看所有回复，支持删除操作
- ✅ **系统设置** - 站点配置、功能开关、阈值设置
- ✅ **敏感词管理** - 添加/删除敏感词，设置处理级别（警告/屏蔽）
- ✅ **数据备份** - 系统数据备份功能

### 系统功能
- ✅ **JWT认证** - 安全的用户认证机制
- ✅ **API限流** - 防止恶意请求
- ✅ **邮件验证** - 支持邮件验证码发送
- ✅ **错误处理** - 完善的错误处理机制
- ✅ **日志记录** - 操作日志和安全日志

## 技术架构

### 前端技术栈
- **React 18** + TypeScript - 现代化前端框架
- **Vite** - 快速构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **React Router v6** - 路由管理
- **Zustand** - 轻量级状态管理
- **React Query** - 数据获取和缓存
- **Axios** - HTTP客户端

### 后端技术栈
- **Node.js** + **Express** - 服务器框架
- **TypeScript** - 类型安全
- **Prisma ORM** - 数据库操作
- **SQLite** - 开发数据库（可切换到PostgreSQL）
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **Nodemailer** - 邮件发送

## 快速开始

### 方法一：一键启动（推荐）

1. 确保已安装 **Node.js 16+**
2. 运行一键启动脚本：
   ```
   start-complete.bat
   ```
3. 等待所有服务启动完成
4. 访问 http://localhost:5173 开始使用

### 方法二：手动启动

1. **启动后端服务**
   ```bash
   cd server
   npm install
   node init-db.js
   node create-test-data.js
   npm run dev
   ```

2. **启动前端服务**
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **访问应用**
   - 前端：http://localhost:5173
   - 后端API：http://localhost:3001

## 默认账号

- **管理员账号**
  - 手机号：13800000000
  - 密码：admin123

- **测试用户**（通过脚本创建）
  - 多个普通用户账号，密码均为 "test123"

## 页面访问

### 主要页面
- **首页**：http://localhost:5173
- **登录页**：http://localhost:5173/login
- **注册页**：http://localhost:5173/register
- **创建盲盒**：http://localhost:5173/create
- **个人中心**：http://localhost:5173/profile

### 管理员页面
- **管理员仪表板**：http://localhost:5173/admin
- **用户管理**：http://localhost:5173/admin/users
- **盲盒管理**：http://localhost:5173/admin/boxes
- **回复管理**：http://localhost:5173/admin/replies
- **系统设置**：http://localhost:5173/admin/settings

### 测试页面
- **登录测试**：http://localhost:5173/simple-test.html
- **后端连接测试**：http://localhost:5173/test-backend.html

## 邮件配置

系统支持邮件验证码发送功能，需配置以下环境变量：

```env
# 邮件配置（可选）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# 前端地址（用于邮件中的链接）
FRONTEND_URL=http://localhost:5173
```

注意：如果不配置邮件服务，系统将在开发环境下打印验证码到控制台。

## 数据库管理

### 重置数据库
```bash
cd server
node init-db.js
```

### 创建测试数据
```bash
cd server
node create-test-data.js
```

### 数据库迁移
```bash
cd server
npx prisma migrate dev
```

## 部署说明

### 开发环境
- 前端：Vite开发服务器（端口5173）
- 后端：Node.js服务器（端口3001）
- 数据库：SQLite文件

### 生产环境
- 前端：静态文件部署（Nginx/Caddy）
- 后端：PM2进程管理
- 数据库：推荐PostgreSQL
- 反向代理：Nginx
- SSL：Let's Encrypt证书

## 目录结构

```
emotion-blind-box/
├── client/                  # 前端代码
│   ├── src/
│   │   ├── components/       # UI组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API服务
│   │   ├── hooks/          # 自定义钩子
│   │   └── utils/          # 工具函数
│   ├── public/             # 静态资源
│   └── package.json
├── server/                 # 后端代码
│   ├── src/
│   │   ├── routes/         # API路由
│   │   ├── middleware/     # 中间件
│   │   ├── utils/          # 工具函数
│   │   └── prisma/         # 数据库相关
│   ├── prisma/             # 数据库模式
│   └── package.json
├── uploads/               # 文件上传目录
├── start-complete.bat      # 一键启动脚本
└── README.md             # 项目说明
```

## API文档

### 认证相关
- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录
- POST `/api/auth/send-verification-code` - 发送验证码
- GET `/api/auth/me` - 获取当前用户信息

### 盲盒相关
- GET `/api/boxes` - 获取盲盒列表
- GET `/api/boxes/random/one` - 随机抽取一个盲盒
- POST `/api/boxes` - 创建盲盒
- GET `/api/boxes/:id` - 获取盲盒详情
- PUT `/api/boxes/:id` - 更新盲盒
- DELETE `/api/boxes/:id` - 删除盲盒

### 回复相关
- POST `/api/replies` - 创建回复
- DELETE `/api/replies/:id` - 删除回复
- POST `/api/replies/:id/like` - 点赞/取消点赞

### 管理员相关
- GET `/api/admin/stats` - 获取系统统计
- GET `/api/admin/users` - 获取用户列表
- GET `/api/admin/boxes` - 获取盲盒列表
- GET `/api/admin/replies` - 获取回复列表
- GET `/api/admin/sensitive-words` - 获取敏感词列表

## 常见问题

### Q: 启动时提示端口被占用？
A: 可能是之前的进程未关闭，请检查并关闭占用3001和5173端口的进程。

### Q: 登录时提示网络错误？
A: 请确保后端服务已启动，可以使用测试页面验证后端连接：http://localhost:5173/test-backend.html

### Q: 邮件验证码收不到？
A: 检查邮件配置是否正确，开发环境下验证码会打印到后端控制台。

### Q: 如何添加新的管理员？
A: 需要直接修改数据库，将用户的role字段更新为'ADMIN'。

### Q: 如何切换到PostgreSQL？
A: 修改.env文件中的DATABASE_URL，并运行`npx prisma migrate dev`。

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 技术支持

如有问题，请查看控制台错误信息或联系技术支持。