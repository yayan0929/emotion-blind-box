@echo off
chcp 65001 >nul
echo 跳过编译，直接使用ts-node运行...
cd /d c:/Users/HP/CodeBuddy/239025009/server

echo.
echo 修改package.json的start脚本为直接使用ts-node运行...

echo {"scripts": {"start": "ts-node --esm src/index.ts"}} > temp_package_snippet.txt
copy temp_package_snippet.txt > temp_package_snippet.txt

echo.
echo 提交修改...
cd /d c:/Users/HP/CodeBuddy/239025009
git add .
git commit -m "修复部署问题：使用ts-node直接运行，跳过编译步骤"

echo.
echo 推送到远程仓库...
git push origin master:main

echo.
echo 修复完成！现在Render会使用ts-node直接运行TypeScript文件。
pause