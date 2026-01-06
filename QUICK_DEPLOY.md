# 快速部署指南

## 部署步骤

### 1. 准备代码

1. 下载并解压整个项目文件夹
2. 进入client目录：`cd client`

### 2. 前端部署到Netlify

#### 方法A：拖拽部署
1. 访问 https://app.netlify.com/drop
2. 将整个`client`文件夹拖拽到页面中
3. 等待部署完成

#### 方法B：命令行部署
1. 安装Netlify CLI：`npm install -g netlify-cli`
2. 在client目录中运行：`netlify deploy --prod --dir=.`
3. 按提示登录并选择站点

### 3. 后端部署到Render

1. 访问 https://render.com
2. 点击"New +" → "Web Service"
3. 连接GitHub仓库或上传代码
4. 设置构建命令：`cd server && npm run build`
5. 设置启动命令：`cd server && npm start`
6. 添加环境变量：
   - `DATABASE_URL`: PostgreSQL数据库连接字符串
   - `JWT_SECRET`: 任意字符串
   - `REFRESH_TOKEN_SECRET`: 任意字符串
   - `NODE_ENV`: `production`

### 4. 更新API地址

部署后端后，需要：
1. 编辑`client/src/services/api.ts`第7行
2. 将`https://your-backend-url.onrender.com/api`替换为实际的后端URL
3. 重新部署前端

### 5. 修改后端CORS设置

在`server/src/index.ts`中确保允许前端域名：
```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.netlify.app', 'http://localhost:5173'],
  credentials: true
}))
```

## 注意事项

1. 确保后端允许前端域名的CORS请求
2. 生产环境必须使用HTTPS
3. 数据库连接字符串要正确
4. 部署后测试所有功能

## 故障排除

### 前端问题
- 检查浏览器控制台错误
- 确认API请求地址正确
- 验证路由配置

### 后端问题
- 检查Render日志
- 验证环境变量设置
- 确认数据库连接

---

按照这些步骤，您应该能够成功部署应用，让其他人都能访问您创建的情绪盲盒交换站！