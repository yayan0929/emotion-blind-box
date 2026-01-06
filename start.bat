@echo off
echo 正在启动大学生情绪盲盒交换站...

echo 1. 初始化数据库...
cd server
node init-db.js

echo 2. 启动后端服务器...
start cmd /k "npm run dev"

echo 3. 等待后端启动...
timeout /t 5

echo 4. 启动前端开发服务器...
cd ../client
start cmd /k "npm run dev"

echo 5. 启动完成！
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:3001
echo 管理员账号: admin / admin123

pause