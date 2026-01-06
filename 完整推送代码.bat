@echo off
echo 正在检查Git配置...
cd /d c:/Users/HP/CodeBuddy/239025009

echo.
echo 检查远程仓库配置:
git remote -v

echo.
echo 添加所有修改到暂存区...
git add .

echo.
echo 提交修改...
git commit -m "修复TypeScript类型错误和配置问题"

echo.
echo 推送代码到远程仓库的main分支...
git push origin master:main

echo.
echo 操作完成！
pause