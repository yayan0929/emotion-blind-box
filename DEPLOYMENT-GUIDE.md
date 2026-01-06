# 部署指南

## 前端部署到Netlify

### 方法1：使用Netlify Drop

1. 访问 https://app.netlify.com/drop
2. 将 `netlify-dist` 文件夹中的所有文件拖拽到页面中
3. 等待部署完成，获取网站URL

### 方法2：使用Netlify CLI

1. 安装Netlify CLI：
   ```
   npm install -g netlify-cli
   ```

2. 登录Netlify：
   ```
   netlify login
   ```

3. 部署网站：
   ```
   cd netlify-dist
   netlify deploy --prod --dir .
   ```

## 后端部署到Render

### 方法1：使用GitHub连接

1. 将项目代码推送到GitHub仓库
2. 访问 https://render.com/
3. 使用GitHub登录
4. 点击 "New +"
5. 选择 "Web Service"
6. 连接您的GitHub仓库
7. 配置构建命令：`cd server && npm install`
8. 配置启动命令：`cd server && npm start`
9. 设置环境变量：
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: 您的JWT密钥
   - `JWT_REFRESH_SECRET`: 您的刷新令牌密钥
   - `DATABASE_URL`: 您的数据库连接字符串（可以使用Render的PostgreSQL）

### 方法2：使用直接部署

1. 将server文件夹打包成zip
2. 在Render上创建新的Web Service
3. 上传zip文件
4. 配置环境变量和启动命令

## 环境变量配置

### 后端环境变量

- `NODE_ENV`: production
- `PORT`: 3001
- `JWT_SECRET`: 您的JWT密钥（随机生成的长字符串）
- `JWT_REFRESH_SECRET`: 您的刷新令牌密钥（随机生成的长字符串）
- `JWT_EXPIRES_IN`: 15m
- `JWT_REFRESH_EXPIRES_IN`: 7d
- `DATABASE_URL`: PostgreSQL数据库连接字符串

### 前端环境变量

- `VITE_API_BASE_URL`: 您的后端API地址（例如：https://your-app.onrender.com）

## 部署后的URL示例

- 前端：https://emotion-blind-box.netlify.app
- 后端：https://emotion-blind-box-api.onrender.com

## 注意事项

1. 确保后端API允许CORS请求
2. 确保前端API_BASE_URL指向正确的后端地址
3. 数据库连接字符串需要正确配置
4. 环境变量需要保密，不要提交到代码仓库