@echo off
title 配置并启动ngrok
echo 正在配置ngrok认证令牌...
echo 令牌: 37qbQWgJqcLpIVk7XdZXWtg9tkW_vDvZav9rjjD9PdipVapK
echo.
cd C:\Users\HP\Downloads\ngrok
ngrok config add-authtoken 37qbQWgJqcLpIVk7XdZXWtg9tkW_vDvZav9rjjD9PdipVapK
echo.
echo 配置完成！按任意键启动ngrok...
pause > nul
echo.
echo 正在启动ngrok...
echo.
ngrok http 3001

pause