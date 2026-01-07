@echo off
chcp 65001 >nul
echo 正在修复部署问题...
echo.

cd /d c:/Users/HP/CodeBuddy/239025009/server
echo 当前目录: %CD%
echo.

echo 步骤1: 修改package.json的start脚本
powershell -Command "(Get-Content package.json | ConvertFrom-Json) | ForEach-Object { $_.scripts.start = 'ts-node --esm src/index.ts'; $_ } | ConvertTo-Json -Depth 10 | Set-Content package.json"

echo 修改结果: %errorlevel%
echo.
pause
echo 按任意键继续到步骤2...
pause >nul
echo.

echo 步骤2: 生成Prisma客户端
npx prisma generate

echo Prisma生成结果: %errorlevel%
echo.
pause
echo 按任意键继续到步骤3...
pause >nul
echo.

echo 步骤3: 提交修改
cd /d c:/Users/HP/CodeBuddy/239025009
git add .

echo Git add结果: %errorlevel%
echo.
git commit -m "修复部署问题：使用ts-node --esm直接运行TypeScript文件"

echo Git commit结果: %errorlevel%
echo.
pause
echo 按任意键继续到步骤4...
pause >nul
echo.

echo 步骤4: 推送到远程仓库
git push origin master:main

echo Git push结果: %errorlevel%
echo.
pause
echo 按任意键结束...
pause >nul