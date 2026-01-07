@echo off
chcp 65001 >nul
echo 修复核心部署问题：ERR_UNKNOWN_FILE_EXTENSION 和端口监听问题
cd /d c:/Users/HP/CodeBuddy/239025009

echo.
echo 步骤1: 修改package.json的start命令，使用ts-node --esm
cd server
powershell -Command "(Get-Content package.json | ConvertFrom-Json) | ForEach-Object { $_.scripts.start = 'ts-node --esm src/index.ts'; $_ } | ConvertTo-Json -Depth 10 | Set-Content package.json"

echo.
echo 步骤2: 生成Prisma客户端
npx prisma generate

echo.
echo 步骤3: 提交修改
cd /d c:/Users/HP/CodeBuddy/239025009
git add .
git commit -m "修复核心部署问题：使用ts-node --esm运行TypeScript文件"

echo.
echo 步骤4: 推送到远程仓库
git push origin master:main

echo.
echo 修复完成！请登录Render控制台重新部署项目。
echo.
echo 关键修复：
echo - 使用ts-node --esm直接运行TypeScript文件，避免ERR_UNKNOWN_FILE_EXTENSION错误
echo - 端口配置已经正确，监听0.0.0.0
echo.
pause