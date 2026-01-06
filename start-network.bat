@echo off
echo 获取本地网络IP地址...
node get-local-ip.js
echo.
echo 正在启动服务器...
echo 请使用以上地址从其他设备访问
echo.
start cmd /k "npm run dev"