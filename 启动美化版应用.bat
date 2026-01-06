@echo off
echo 正在启动大学生情绪盲盒交换站...
echo.

echo 1. 关闭现有的Node.js进程...
taskkill /f /im node.exe > nul 2>&1

echo 2. 启动后端服务器...
start "后端服务器" cmd /k "cd /d %~dp0 && npm run dev:server"

echo 3. 等待后端服务器启动...
timeout /t 5 /nobreak > nul

echo 4. 启动前端服务器...
start "前端服务器" cmd /k "cd /d %~dp0 && npm run dev:client"

echo 5. 等待前端服务器启动...
timeout /t 5 /nobreak > nul

echo 6. 打开网站...
start http://localhost:5173

echo.
echo 启动完成！
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:3001
echo.
pause