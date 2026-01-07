@echo off
chcp 65001 >nul
echo 直接修复运行问题...
cd /d c:/Users/HP/CodeBuddy/239025009/server

echo.
echo 步骤1: 修改package.json的start命令
powershell -Command "(Get-Content package.json | ConvertFrom-Json) | ForEach-Object { $_.scripts.start = 'ts-node --esm src/index.ts'; $_ } | ConvertTo-Json -Depth 10 | Set-Content package.json"

echo.
echo 步骤2: 提交修改
cd /d c:/Users/HP/CodeBuddy/239025009
git add .
git commit -m "修复运行问题：使用ts-node --esm直接运行"

echo.
echo 步骤3: 推送代码
git push origin master:main

echo.
echo 完成！请在Render控制台重新部署。
pause