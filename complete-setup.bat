@echo off
echo ==========================================
echo 大学生情绪盲盒交换站 - 完整安装脚本
echo ==========================================

echo 1. 检查 Node.js 是否安装...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：未检测到 Node.js，请先安装 Node.js 16 或更高版本
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js 已安装

echo.
echo 2. 安装项目依赖...

echo 正在安装根目录依赖...
call npm install

echo 正在安装服务器依赖...
cd server
call npm install

echo 正在生成 Prisma 客户端...
call npx prisma generate

echo 正在创建数据库...
call npx prisma db push

echo 正在初始化数据库...
call node init-db.js

echo.
echo 3. 安装客户端依赖...
cd ..\client
call npm install

echo.
echo ==========================================
echo 安装完成！
echo ==========================================
echo.
echo 您可以使用以下方式启动项目：
echo.
echo 1. 简单启动：双击项目根目录下的 start.bat
echo 2. 手动启动：在项目根目录运行 npm run dev
echo.
echo 访问地址：
echo - 前端：http://localhost:5173
echo - 后端：http://localhost:3001
echo - 管理员账号：admin / admin123
echo.

pause