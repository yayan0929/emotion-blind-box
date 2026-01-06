@echo off
title 大学生情绪盲盒交换站 - 完整启动

echo ==========================================
echo    大学生情绪盲盒交换站 - 完整启动
echo ==========================================
echo.

echo [步骤1] 检查Node.js环境...
node --version
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js 16或更高版本
    pause
    exit /b
)

echo.
echo [步骤2] 安装后端依赖...
cd server
call npm install
if %errorlevel% neq 0 (
    echo 错误: 后端依赖安装失败
    pause
    exit /b
)

echo.
echo [步骤3] 初始化数据库...
call node init-db.js
if %errorlevel% neq 0 (
    echo 警告: 数据库初始化失败，可能已存在数据
)

echo.
echo [步骤4] 创建测试数据...
call node create-test-data.js
if %errorlevel% neq 0 (
    echo 警告: 测试数据创建失败，可能已存在数据
)

echo.
echo [步骤5] 启动后端服务...
start "后端服务" cmd /k "npm run dev"

echo.
echo [步骤6] 安装前端依赖...
cd ../client
call npm install
if %errorlevel% neq 0 (
    echo 错误: 前端依赖安装失败
    pause
    exit /b
)

echo.
echo [步骤7] 启动前端服务...
start "前端服务" cmd /k "npm run dev"

echo.
echo ==========================================
echo    系统启动完成！
echo ==========================================
echo.
echo 后端服务: http://localhost:3001
echo 前端服务: http://localhost:5173
echo.
echo 测试页面:
echo - 登录测试: http://localhost:5173/simple-test.html
echo - 后端测试: http://localhost:5173/test-backend.html
echo.
echo 默认管理员账号:
echo - 手机号: 13800000000
echo - 密码: admin123
echo.
echo 按任意键关闭此窗口...
pause > nul