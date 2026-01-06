@echo off
title 部署到Netlify
echo.
echo ========================================
echo  大学生情绪盲盒交换站 - Netlify部署工具
echo ========================================
echo.

echo 步骤1: 检查Node.js是否安装...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js已安装
echo.

echo 步骤2: 安装依赖...
cd client
call npm install
echo.

echo 步骤3: 构建前端项目...
call npx vite build
if %errorlevel% neq 0 (
    echo 构建失败，尝试替代构建方法...
    call npx vite build --mode production
)
echo.

echo 步骤4: 检查构建结果...
if not exist "dist" (
    echo 错误: 未找到dist目录，构建可能失败
    pause
    exit /b 1
)
echo ✓ 前端构建完成
echo.

echo 步骤5: 准备部署文件...
cd ..
if exist "netlify-dist" (
    rd /s /q "netlify-dist"
)
xcopy /E /I client netlify-dist
echo.

echo ========================================
echo  构建完成！现在可以部署到Netlify了
echo ========================================
echo.
echo 方法1 (推荐): 拖拽部署
echo 1. 访问 https://app.netlify.com/drop
echo 2. 将 netlify-dist 文件夹拖拽到页面中
echo.
echo 方法2: 命令行部署
echo 1. 安装Netlify CLI: npm install -g netlify-cli
echo 2. 运行: cd netlify-dist && netlify deploy --prod --dir=.
echo.
echo 部署完成后，请记得:
echo - 如果部署了后端，需要更新 client/src/services/api.ts 中的API URL
echo - 测试网站所有功能是否正常工作
echo.
pause