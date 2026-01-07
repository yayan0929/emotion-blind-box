@echo off
chcp 65001 >nul
echo Checking current git configuration...
cd /d c:/Users/HP/CodeBuddy/239025009
git config --list | findstr -i http

echo.
echo If you're using a proxy, you may need to configure git to use it.
echo Example commands (replace with your actual proxy address and port):
echo git config --global http.proxy http://proxy.server.com:port
echo git config --global https.proxy https://proxy.server.com:port
echo.
echo To remove proxy configuration:
echo git config --global --unset http.proxy
echo git config --global --unset https.proxy
echo.
pause