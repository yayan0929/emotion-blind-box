@echo off
echo 准备部署到Netlify...
echo.

echo 1. 检查netlify-dist目录...
if not exist "netlify-dist" (
    echo 创建netlify-dist目录...
    mkdir netlify-dist
)

echo 2. 复制前端文件...
copy client\public\*.html netlify-dist\ /Y > nul

echo 3. 创建Netlify配置文件...
echo # 将所有API请求重定向到后端服务器 > netlify-dist\_redirects
echo /api/* https://emotion-blind-box-api.onrender.com/:splat 200 >> netlify-dist\_redirects
echo. >> netlify-dist\_redirects
echo # 将所有其他请求重定向到index.html >> netlify-dist\_redirects
echo /* /index.html 200 >> netlify-dist\_redirects

echo [build] > netlify-dist\netlify.toml
echo publish = "." >> netlify-dist\netlify.toml
echo. >> netlify-dist\netlify.toml
echo [[redirects]] >> netlify-dist\netlify.toml
echo from = "/api/*" >> netlify-dist\netlify.toml
echo to = "https://emotion-blind-box-api.onrender.com/:splat" >> netlify-dist\netlify.toml
echo status = 200 >> netlify-dist\netlify.toml
echo force = true >> netlify-dist\netlify.toml
echo. >> netlify-dist\netlify.toml
echo [[redirects]] >> netlify-dist\netlify.toml
echo from = "/*" >> netlify-dist\netlify.toml
echo to = "/index.html" >> netlify-dist\netlify.toml
echo status = 200 >> netlify-dist\netlify.toml

echo 4. 打开Netlify Drop页面...
start https://app.netlify.com/drop

echo.
echo 准备完成！
echo 请将 netlify-dist 文件夹中的所有文件拖拽到打开的页面中
echo.
echo 注意：您需要先将后端部署到Render或其他服务
echo 然后修改 netlify-dist\_redirects 和 netlify-dist\netlify.toml 文件中的API地址
echo.
pause