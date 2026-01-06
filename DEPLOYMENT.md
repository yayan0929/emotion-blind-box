# 部署指南

本指南将帮助您将"大学生情绪盲盒交换站"应用部署到生产环境，让其他人都可以访问您创建的网站。

## 前端部署 (Netlify)

### 1. 准备前端代码

1. 确保前端代码可以正常构建：
```bash
cd client
npm run build
```

2. 修改API配置（已完成）：
   - 前端已配置为在生产环境下连接到远程后端服务
   - 需要先将后端服务部署到Render或其他服务

### 2. 部署到Netlify

1. 访问 https://app.netlify.com/drop
2. 将`client/dist`文件夹拖拽到部署区域
3. 或者按照以下步骤操作：

   a. 在Netlify上创建新网站
   b. 连接到GitHub仓库（如果代码已上传）
   c. 设置构建命令：`npm run build`
   d. 设置发布目录：`dist`

### 3. 配置环境变量

在Netlify控制台中设置以下环境变量（如果需要）：
- `REACT_APP_API_URL`: 后端服务的URL

## 后端部署 (Render)

### 1. 准备后端代码

1. 确保后端代码可以正常运行：
```bash
cd server
npm install
npm run build
```

2. 检查环境配置：
   - 查看`server/.env`文件
   - 确保所有必要的环境变量都已设置

### 2. 部署到Render

1. 访问 https://render.com
2. 创建新的Web Service
3. 连接到GitHub仓库或上传代码
4. 设置构建命令：`npm run build`
5. 设置启动命令：`npm start`

### 3. 配置环境变量

在Render控制台中设置以下环境变量：
- `DATABASE_URL`: PostgreSQL数据库连接字符串
- `JWT_SECRET`: JWT签名密钥
- `REFRESH_TOKEN_SECRET`: 刷新令牌签名密钥
- `NODE_ENV`: `production`

## 部署后配置

### 1. 更新前端API配置

部署后端服务后，需要更新前端代码中的API URL：

1. 编辑`client/src/services/api.ts`文件
2. 将第7行的URL替换为实际的后端服务URL：
```typescript
return 'https://your-backend-url.onrender.com/api'; // 替换为实际的后端URL
```

3. 重新构建并部署前端：
```bash
cd client
npm run build
```

### 2. 测试部署

1. 访问前端URL，测试基本功能
2. 测试用户注册和登录功能
3. 测试盲盒创建和浏览功能

## 注意事项

1. **数据库**: 确保使用生产环境的PostgreSQL数据库
2. **安全性**: 在生产环境中使用HTTPS和安全头
3. **环境变量**: 不要在代码中硬编码敏感信息
4. **CORS**: 确保后端服务允许前端域名访问
5. **文件上传**: 检查文件上传功能在生产环境中的工作情况

## 故障排除

### 常见问题

1. **API请求失败**:
   - 检查CORS设置
   - 确认API URL正确
   - 验证环境变量配置

2. **路由问题**:
   - 检查Netlify重定向规则
   - 确认前端路由配置

3. **认证问题**:
   - 检查JWT密钥配置
   - 验证token存储逻辑

### 获取帮助

如果遇到问题：
1. 检查浏览器控制台错误
2. 查看服务器日志
3. 参考Netlify和Render的文档

## 后续维护

1. 定期更新依赖
2. 监控应用性能
3. 备份数据库
4. 监控安全漏洞

---

部署完成后，您就可以与他人分享网站链接，让其他人也能使用您创建的情绪盲盒交换站了！