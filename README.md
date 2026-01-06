# 大学生情绪盲盒交换站

一个面向大学生群体的匿名情绪互助平台，用户可以上传情绪内容封装为"情绪盲盒"，并随机抽取他人盲盒进行匿名回复，提供温暖互助的社区环境。

## 项目结构

```
emotion-blind-box-exchange/
├── client/                # 前端应用 (React + TypeScript)
│   ├── src/
│   │   ├── components/     # 共用组件
│   │   ├── pages/         # 页面组件
│   │   ├── hooks/         # 自定义Hook
│   │   ├── store/         # 状态管理
│   │   ├── services/      # API服务
│   │   ├── utils/         # 工具函数
│   │   └── types/         # 类型定义
│   ├── public/
│   └── package.json
├── server/                # 后端API服务 (Node.js + Express)
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── middleware/    # 中间件
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由定义
│   │   ├── utils/         # 工具函数
│   │   ├── config/        # 配置文件
│   │   └── types/         # 类型定义
│   └── package.json
└── README.md
```

## 功能特性

### 用户端功能
- 注册与登录（手机号/学号注册，支持验证码和密码登录）
- 情绪盲盒上传（文字+图片）
- 盲盒抽取与查看
- 匿名回复功能
- 点赞互动
- 个人中心（我的盲盒、我的回复、我的点赞、个人设置）

### 管理员功能
- 用户管理
- 情绪盲盒管理
- 回复内容管理
- 数据统计与分析
- 系统设置

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Query
- Zustand

### 后端
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite/PostgreSQL
- JWT认证
- bcrypt密码加密

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖
```bash
npm run install:all
```

### 开发模式
```bash
npm run dev
```

### 构建项目
```bash
npm run build
```

### 启动生产环境
```bash
npm start
```

## 部署说明

项目支持多种部署方式：
1. 传统服务器部署（使用PM2）
2. Docker容器化部署
3. 云平台部署（如腾讯云、阿里云等）

详细部署说明请参考相关文档。