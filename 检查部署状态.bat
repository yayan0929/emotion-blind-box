@echo off
title 部署状态检查工具
echo.
echo ==========================================
echo  大学生情绪盲盒交换站 - 部署状态检查
echo ==========================================
echo.
echo 这个工具将帮助您检查部署状态并收集诊断信息
echo.

echo 正在检查本地代码状态...
cd /d c:/Users/HP/CodeBuddy/239025009

echo.
echo 检查git状态...
git status
echo.

echo 检查前端代码...
cd client
if exist "dist" (
    echo ✓ 前端构建文件存在
) else (
    echo ✗ 前端构建文件不存在，需要先构建
    echo 正在尝试构建前端...
    call npm run build
    if %errorlevel% neq 0 (
        echo 前端构建失败，请检查错误信息
    )
)

echo.
echo 检查后端代码...
cd ..\server
if exist "dist" (
    echo ✓ 后端构建文件存在
) else (
    echo ✗ 后端构建文件不存在，需要先构建
    echo 正在尝试构建后端...
    call npm run build
    if %errorlevel% neq 0 (
        echo 后端构建失败，请检查错误信息
    )
)

echo.
echo ==========================================
echo  请提供以下信息以获得更好的帮助
echo ==========================================
echo.
echo 1. 您的Render服务URL:
echo 2. 您的Netlify网站URL:
echo 3. 部署时看到的具体错误信息:
echo 4. 服务器日志中的错误信息（可以在Render控制台的Logs选项卡中找到）
echo.
echo 打开故障排除指南...
start "" "c:/Users/HP/CodeBuddy/239025009/部署故障排除指南.md"

echo.
echo 是否要打开Render控制台检查日志？
pause
start "" "https://dashboard.render.com"

echo.
echo 是否要测试本地后端？
pause
cd ..\server
npm start
echo.

echo 检查完成！
echo 如果问题仍然存在，请提供上述信息以获得进一步帮助
pause