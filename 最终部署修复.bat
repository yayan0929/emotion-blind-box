@echo off
chcp 65001 >nul
echo 最终修复部署问题...
cd /d c:/Users/HP/CodeBuddy/239025009

echo.
echo 修改服务器启动方式，直接使用ts-node运行...

cd server
echo 修改package.json的start脚本...
powershell -Command "(Get-Content package.json) -replace '\"start\": \"ts-node src/index.ts\"', '\"start\": \"ts-node --esm src/index.ts\"' | Set-Content package.json"

echo.
echo 生成Prisma客户端...
npx prisma generate

echo.
echo 提交修改...
cd /d c:/Users/HP/CodeBuddy/239025009
git add .
git commit -m "修复部署问题：使用ts-node --esm直接运行TypeScript文件"

echo.
echo 推送到远程仓库...
git push origin master:main

echo.
echo 修复完成！现在在Render上重新部署应该能正常工作。
pause