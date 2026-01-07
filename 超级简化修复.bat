@echo off
chcp 65001 >nul
echo 超级简化修复方案...
cd /d c:/Users/HP/CodeBuddy/239025009/server

echo.
echo 1. 进入服务器目录并修改package.json...
cd server
powershell -Command "(gc package.json | ConvertFrom-Json) | %{ $_.scripts.start = 'ts-node --esm src/index.ts'; $_ } | ConvertTo-Json -Depth 1 | Out-String | Set-Content package.json"

echo.
echo 2. 生成Prisma客户端...
npx prisma generate

echo.
echo 3. 提交修改...
cd /d c:/Users/HP/CodeBuddy/239025009
git add .
git commit -m "修复部署问题：使用ts-node --esm直接运行"

echo.
echo 4. 推送代码...
git push origin master:main

echo.
echo 修复完成！请到Render控制台重新部署。
pause