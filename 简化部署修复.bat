@echo off
chcp 65001 >nul
echo 简化部署修复方案...
cd /d c:/Users/HP/CodeBuddy/239025009/server

echo.
echo 修改package.json，使用ts-node直接运行...
powershell -Command "$content = Get-Content package.json | ConvertFrom-Json; $content.scripts.start = 'ts-node --esm src/index.ts'; $content | ConvertTo-Json -Depth 10 | Set-Content package.json"

echo.
echo 生成Prisma客户端...
npx prisma generate

echo.
echo 提交所有修改...
cd /d c:/Users/HP/CodeBuddy/239025009
git add .
git commit -m "修复部署问题：使用ts-node --esm直接运行，避免编译错误"

echo.
echo 推送到远程仓库...
git push origin master:main

echo.
echo 修复完成！现在在Render控制台重新部署项目。
echo.
echo 如果仍有问题，请检查Render日志中的错误信息。
pause