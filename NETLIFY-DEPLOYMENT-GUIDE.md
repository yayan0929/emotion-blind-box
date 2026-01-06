# Netlify 快速部署指南

本指南将帮助您将"大学生情绪盲盒交换站"应用部署到Netlify，让所有人都可以访问您的网站。

## 步骤1：准备前端代码

1. 打开命令行终端
2. 进入项目目录：
   ```
   cd c:/Users/HP/CodeBuddy/239025009/client
   ```
3. 安装依赖：
   ```
   npm install
   ```
4. 构建前端项目：
   ```
   npm run build
   ```
   如果构建失败，可以使用这个替代命令：
   ```
   npx vite build
   ```

## 步骤2：部署到Netlify

### 方法一：拖拽部署（最简单）

1. 访问：https://app.netlify.com/drop
2. 将整个`client`文件夹拖拽到页面的部署区域
3. 等待部署完成，您将获得一个临时的Netlify域名

### 方法二：使用Netlify CLI

1. 安装Netlify CLI：
   ```
   npm install -g netlify-cli
   ```
2. 在client目录中运行：
   ```
   netlify deploy --prod --dir=dist
   ```
3. 按照提示登录Netlify并选择站点

## 步骤3：后端部署（可选）

您可以使用以下任一平台部署后端：

### Render部署（推荐）

1. 访问：https://render.com
2. 点击"New +" → "Web Service"
3. 连接到GitHub仓库或上传代码
4. 设置构建命令：`cd server && npm run build`
5. 设置启动命令：`cd server && npm start`
6. 添加环境变量：
   - `DATABASE_URL`: PostgreSQL数据库连接字符串
   - `JWT_SECRET`: 任意字符串（如"my-secret-key"）
   - `REFRESH_TOKEN_SECRET`: 任意字符串（如"my-refresh-secret"）
   - `NODE_ENV`: `production`

### 其他选择

您也可以使用以下平台部署后端：
- Heroku
- Vercel
- AWS Amplify
- DigitalOcean App Platform

## 步骤4：更新前端API配置

部署后端后，需要更新前端API配置：

1. 编辑 `client/src/services/api.ts` 文件
2. 找到第12行：`return 'https://your-backend-url.onrender.com/api';`
3. 将 `your-backend-url.onrender.com` 替换为您实际的后端URL
4. 重新构建并部署前端

## 步骤5：测试部署

1. 访问您的Netlify网站URL
2. 测试基本功能（无需登录）
3. 如果部署了后端，测试完整功能（注册、登录、创建盲盒等）

## 常见问题解决

### 构建失败

如果构建过程中遇到TypeScript错误，可以：

1. 尝试忽略TypeScript错误：
   ```
   npx vite build --mode production
   ```

2. 或者修改 `client/package.json` 中的构建命令：
   ```json
   "build": "vite build"
   ```

### API请求失败

1. 确保后端已正确部署并可访问
2. 检查CORS设置，确保允许前端域名访问
3. 验证API URL配置正确

### 部署后页面空白

1. 检查浏览器控制台是否有错误
2. 确保路由配置正确
3. 检查资源路径是否正确

## 完成部署

部署完成后，您就可以与他人分享您的网站链接，让其他人也能使用您创建的情绪盲盒交换站了！

## 示例链接格式

- 前端：`https://your-site-name.netlify.app`
- 后端：`https://your-backend-name.onrender.com`