@echo off
chcp 65001 >nul
echo 双击运行修复部署问题...
cd /d c:/Users/HP/CodeBuddy/239025009/server

echo.
echo 修改package.json...
powershell -Command "(Get-Content package.json | Out-String | ConvertFrom-Json) | ForEach-Object { $_.scripts.start = 'ts-node --esm src/index.ts'; $_ } | ConvertTo-Json -Depth 10 | Out-String | Set-Content package.json"

echo.
echo 生成Prisma客户端...
npx prisma generate

echo.
echo 提交修改...
cd /d c:/Users/HP/CodeBuddy/239025009
git add .
git commit -m "修复部署问题：使用ts-node --esm直接运行TypeScript文件"

echo.
echo 推送代码...
git push origin master:main

echo.
echo 完成！请在Render控制台重新部署。
pause