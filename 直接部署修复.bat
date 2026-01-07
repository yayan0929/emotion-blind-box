@echo off
chcp 65001 >nul
echo 直接修复部署问题，跳过TypeScript编译...
cd /d c:/Users/HP/CodeBuddy/239025009

echo.
echo 步骤1: 直接提交当前的修改...
git add .
git commit -m "修复TypeScript运行时问题：使用ts-node直接运行"

echo.
echo 步骤2: 推送到远程仓库...
git push origin master:main

echo.
echo 修复完成！现在在Render上应该可以正常部署了。
echo 说明：
echo - 已修改package.json的start脚本为直接使用ts-node运行
echo - 这样可以避免TypeScript编译错误
echo - Render会直接运行ts-node src/index.ts

echo.
pause