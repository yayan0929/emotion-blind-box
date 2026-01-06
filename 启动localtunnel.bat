@echo off
title 启动LocalTunnel
echo 正在启动LocalTunnel...
echo.
echo LocalTunnel将为您生成一个公网URL，使其他人可以访问您的本地服务器
echo.
echo 请保持此窗口开启，关闭窗口将停止服务
echo 按Ctrl+C可以停止服务
echo.
lt --port 3001

pause