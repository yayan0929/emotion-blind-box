@echo off
title 启动ngrok
echo 正在启动ngrok...
echo.
echo Ngrok将为您生成一个公网URL，使其他人可以访问您的本地服务器
echo.
echo 请保持此窗口开启，关闭窗口将停止ngrok服务
echo 按Ctrl+C可以停止服务
echo.
cd C:\Users\HP\Downloads\ngrok
ngrok authtoken 37qbQWgJqcLpIVk7XdZXWtg9tkW_vDvZav9rjjD9PdipVapK
ngrok http 3001

pause