@echo off
title 配置ngrok
echo 正在配置ngrok认证令牌...
echo.
echo 令牌: 37qbQWgJqcLpIVk7XdZXWtg9tkW_vDvZav9rjjD9PdipVapK
echo.
cd C:\Users\HP\Downloads\ngrok
ngrok config add-authtoken 37qbQWgJqcLpIVk7XdZXWtg9tkW_vDvZav9rjjD9PdipVapK
echo.
echo 配置完成！现在启动ngrok...
echo.
ngrok http 3001

pause