@echo off
chcp 65001 >nul
echo Pushing TypeScript type fixes...
cd /d c:/Users/HP/CodeBuddy/239025009
git push origin master:main
echo.
echo Fix code pushed successfully!
echo You can now re-deploy on Render.
pause