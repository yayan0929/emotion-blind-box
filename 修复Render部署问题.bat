@echo off
title 修复Render部署问题
echo.
echo ==========================================
echo  修复Render部署问题工具
echo ==========================================
echo.
echo 正在为您修复Render部署失败的问题...
echo.
echo 问题原因：您的项目使用SQLite数据库，但Render需要PostgreSQL
echo 解决方案：已为您修改数据库配置为PostgreSQL
echo.

echo 步骤1：提交代码更改
cd /d c:/Users/HP/CodeBuddy/239025009
echo 正在提交更改到Git...
git add .
git commit -m "修复数据库配置：从SQLite改为PostgreSQL"

echo.
echo 步骤2：推送更改到GitHub
git push
echo.

echo ==========================================
echo  请按照以下步骤重新部署
echo ==========================================
echo.
echo 1. 在Render控制台中，删除现有的服务（如果有）
echo 2. 重新创建Web Service
echo 3. 确保设置以下参数：
echo    - 根目录：server
echo    - 构建命令：npm install && npm run build
echo    - 启动命令：npm start
echo.
echo 4. 在环境变量中设置：
echo    - DATABASE_URL：从Render PostgreSQL页面复制
echo    - JWT_SECRET：emotion-blind-box-jwt-secret-key-change-in-production-2023
echo    - JWT_REFRESH_SECRET：emotion-blind-box-refresh-secret-key-change-in-production-2023
echo    - NODE_ENV：production
echo    - PORT：3001
echo.
echo 5. 如果您还没有创建数据库，请先创建一个PostgreSQL数据库
echo.

echo 是否要打开Render控制台？
pause
start "" "https://dashboard.render.com"

echo.
echo 是否要查看详细部署指南？
pause
start "" "c:/Users/HP/CodeBuddy/239025009/完整部署指南.md"

echo.
echo 修复完成！现在请按照上述步骤重新部署您的服务。
echo.
pause