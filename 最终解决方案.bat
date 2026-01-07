@echo off
chcp 65001 >nul
echo 正在应用最终解决方案...
cd /d c:/Users/HP/CodeBuddy/239025009

echo.
echo 1. 进入服务器目录...
cd server

echo 2. 直接修改package.json的start命令...
echo 修改前:
type package.json | findstr "start"
echo.

echo 3. 修改package.json...
powershell -Command "(Get-Content 'package.json' -Raw) -replace '\"start\": \".*\"', '\"start\": \"ts-node --esm src/index.ts\"' | Set-Content 'package.json'"

echo 修改后:
type package.json | findstr "start"
echo.

echo 4. 生成Prisma客户端...
npx prisma generate

echo.
echo 5. 提交修改...
cd /d c:/Users/HP/CodeBuddy/239025009
git add .
git commit -m "修复部署问题：使用ts-node --esm直接运行TypeScript文件"

echo.
echo 6. 推送到远程仓库...
git push origin master:main

echo.
echo 修复完成！请在Render控制台重新部署项目。
pause