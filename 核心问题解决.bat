@echo off
chcp 65001 >nul
echo 解决核心部署问题：ERR_UNKNOWN_FILE_EXTENSION 和端口监听
cd /d c:/Users/HP/CodeBuddy/239025009/server

echo.
echo 步骤1: 修改package.json的start命令
powershell -Command "(Get-Content package.json | ConvertFrom-Json) | ForEach-Object { $_.scripts.start = 'ts-node --esm src/index.ts'; $_ } | ConvertTo-Json -Depth 10 | Set-Content package.json"

echo.
echo 步骤2: 生成Prisma客户端
npx prisma generate

echo.
echo 步骤3: 提交修改
cd /d c:/Users/HP/CodeBuddy/239025009
git add .
git commit -m "修复部署问题：使用ts-node --esm直接运行TypeScript文件"

echo.
echo 步骤4: 推送到远程仓库
git push origin master:main

echo.
echo 修复完成！请在Render控制台重新部署项目。
pause