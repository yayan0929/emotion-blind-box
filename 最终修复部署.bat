@echo off
chcp 65001 >nul
echo 最终修复部署问题...
cd /d c:/Users/HP/CodeBuddy/239025009

echo.
echo 步骤1: 修改package.json的启动命令，使用ts-node --esm
cd server
set JSON_FILE=package.json
powershell -Command "(Get-Content '%JSON_FILE%' | ConvertFrom-Json) | ForEach-Object { $_.scripts.start = 'ts-node --esm src/index.ts'; $_ } | ConvertTo-Json -Depth 10 | Set-Content '%JSON_FILE%'"

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
echo 修复完成！请登录Render控制台重新部署项目。
echo.
echo 修复总结：
echo - 使用ts-node --esm直接运行TypeScript，避免ERR_UNKNOWN_FILE_EXTENSION
echo - 端口已配置为监听0.0.0.0，符合Render要求
echo.
pause