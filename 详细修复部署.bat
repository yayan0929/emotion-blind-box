@echo off
chcp 65001 >nul
echo 正在修复Render部署问题...
echo.

cd /d c:/Users/HP/CodeBuddy/239025009
echo 当前目录: %CD%
echo.

echo 步骤1: 检查Git状态
git status
echo.
pause

echo 步骤2: 编译TypeScript到JavaScript...
cd /d c:/Users/HP/CodeBuddy/239025009/server
npx tsc

if %errorlevel% neq 0 (
    echo TypeScript编译失败，错误代码: %errorlevel%
    pause
    exit /b 1
) else (
    echo TypeScript编译成功
)
echo.
pause

echo 步骤3: 生成Prisma客户端...
npx prisma generate

if %errorlevel% neq 0 (
    echo Prisma客户端生成失败，错误代码: %errorlevel%
    pause
    exit /b 1
) else (
    echo Prisma客户端生成成功
)
echo.
pause

echo 步骤4: 检查dist目录是否生成
if exist "dist\index.js" (
    echo 找到编译后的文件: dist\index.js
) else (
    echo 错误: 未找到编译后的文件
    pause
    exit /b 1
)
echo.
pause

echo 步骤5: 提交所有修改...
cd /d c:/Users/HP/CodeBuddy/239025009
git add .
git commit -m "修复Render部署问题：改用编译后JS运行和端口监听配置"

if %errorlevel% neq 0 (
    echo Git提交失败，错误代码: %errorlevel%
    pause
    exit /b 1
) else (
    echo Git提交成功
)
echo.
pause

echo 步骤6: 推送代码到远程仓库...
git push origin master:main

if %errorlevel% neq 0 (
    echo Git推送失败，错误代码: %errorlevel%
    pause
    exit /b 1
) else (
    echo Git推送成功
)
echo.

echo 所有步骤已完成！请在Render控制台重新部署。
pause