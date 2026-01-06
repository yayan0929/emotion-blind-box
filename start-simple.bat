@echo off
echo ==========================================
echo 大学生情绪盲盒交换站 - 启动脚本
echo ==========================================

echo 1. 启动后端服务器...
cd /d "%~dp0server"
start "后端服务器" cmd /k "npm run dev"

echo 2. 等待后端启动...
timeout /t 8 /nobreak

echo 3. 启动前端服务器...
cd /d "%~dp0client"
start "前端服务器" cmd /k "npm run dev"

echo.
echo 服务器启动完成！
echo.
echo 前端地址: http://localhost:5173/simple-test.html
echo 后端地址: http://localhost:3001
echo.
echo 管理员账号: admin / admin123
echo.
echo 请等待服务器启动完成后再访问...
echo.

pause