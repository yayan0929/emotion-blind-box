@echo off
title 大学生情绪盲盒交换站 - 完整部署工具
echo.
echo ==========================================
echo  大学生情绪盲盒交换站 - 完整部署工具
echo ==========================================
echo.
echo 这个脚本将指导您完成前后端和数据库的完整部署
echo.
pause

echo.
echo ==========================================
echo  第一步：准备前端代码
echo ==========================================
echo.

echo 正在进入client目录...
cd client

echo 正在安装依赖...
call npm install

echo 正在构建前端...
call npx vite build --mode production
if %errorlevel% neq 0 (
    echo 构建失败，尝试替代方法...
    call npx vite build
)

echo.
echo 检查构建结果...
if not exist "dist" (
    echo 错误: 未找到dist目录，构建可能失败
    pause
    exit /b 1
)
echo ✓ 前端构建完成
echo.

echo.
echo ==========================================
echo  部署指南
echo ==========================================
echo.
echo 前端已构建完成，请按照以下步骤进行部署：
echo.
echo 1. 部署后端和数据库：
echo    a) 访问 https://render.com 并注册账号
echo    b) 创建PostgreSQL数据库
echo    c) 创建Web Service并连接到您的GitHub仓库
echo    d) 设置环境变量（详见完整部署指南）
echo.
echo 2. 部署前端到Netlify：
echo    a) 访问 https://app.netlify.com/drop
echo    b) 将 client\dist 文件夹拖拽到页面中
echo.
echo 3. 更新配置：
echo    a) 在Render中更新CORS_ORIGIN为您的Netlify域名
echo    b) 在前端代码中更新API URL为您的Render后端URL
echo.
echo 完整的详细步骤请参考"完整部署指南.md"文件
echo.
echo 现在是否要打开部署指南？
pause
start "" "c:/Users/HP/CodeBuddy/239025009/完整部署指南.md"

echo.
echo 是否要打开Netlify部署页面？
pause
start "" "https://app.netlify.com/drop"

echo.
echo 是否要打开Render控制台？
pause
start "" "https://render.com"

echo.
echo ==========================================
echo  部署准备完成！
echo ==========================================
echo.
echo 前端代码已构建完成，请按照上述步骤进行部署
echo 部署完成后，您的网站将可以被所有人访问
echo.
pause