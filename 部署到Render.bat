@echo off
echo 准备部署后端到Render...
echo.

echo 1. 打开Render网站...
start https://render.com/

echo.
echo 部署步骤：
echo 1. 使用GitHub账号登录
echo 2. 点击 "New +" 按钮
echo 3. 选择 "Web Service"
echo 4. 连接您的GitHub仓库
echo 5. 配置部署设置：
echo    - Name: emotion-blind-box-api
echo    - Root Directory: server
echo    - Build Command: npm install
echo    - Start Command: npm start
echo 6. 添加环境变量：
echo    - NODE_ENV: production
echo    - PORT: 3001
echo    - JWT_SECRET: [点击生成按钮]
echo    - JWT_REFRESH_SECRET: [点击生成按钮]
echo    - JWT_EXPIRES_IN: 15m
echo    - JWT_REFRESH_EXPIRES_IN: 7d
echo 7. 点击 "Create Web Service"
echo.
echo 8. 部署数据库：
echo    - 点击 "New +" 按钮
echo    - 选择 "PostgreSQL"
echo    - Name: emotion-blind-box-db
echo    - Database Name: emotion_blind_box
echo    - User: admin
echo    - 点击 "Create Database"
echo    - 获取数据库连接字符串
echo    - 回到后端服务，添加环境变量：
echo      DATABASE_URL: [粘贴数据库连接字符串]
echo.
echo 9. 初始化数据库：
echo    - 部署完成后，使用以下命令初始化数据库：
echo      curl https://your-api-url.onrender.com/api/prisma/migrate
echo.
pause