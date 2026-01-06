@echo off
title 大学生情绪盲盒交换站
echo 正在启动大学生情绪盲盒交换站...
echo.
echo 前端地址: http://localhost:5173
echo 后端地址: http://localhost:3001
echo 管理员后台: http://localhost:5173/admin.html
echo.
echo 请保持此窗口开启，关闭窗口将停止服务
echo 按Ctrl+C可以停止服务
echo.

cd /d %~dp0
npm run dev

pause