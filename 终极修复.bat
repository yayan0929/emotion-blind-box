@echo off
chcp 65001 >nul
echo 终极简化修复方案...
cd /d c:/Users/HP/CodeBuddy/239025009/server

echo.
echo 1. 直接编辑package.json...
echo 正在备份原始文件...
copy package.json pkg.bak >nul

echo 正在创建新的package.json...
(
echo {
echo   "name": "emotion-blind-box-server",
echo   "version": "1.0.0",
echo   "description": "大学生情绪盲盒交换站 - 后端API服务",
echo   "main": "dist/index.js",
echo   "scripts": {
echo     "prestart": "npm install --production=false",
echo     "dev": "tsx watch src/index.ts",
echo     "build": "tsc",
echo     "start": "ts-node --esm src/index.ts",
echo     "db:migrate": "prisma migrate deploy",
echo     "db:generate": "prisma generate",
echo     "db:seed": "ts-node src/prisma/seed.ts",
echo     "db:studio": "prisma studio"
echo   },
echo   "type": "commonjs"
echo } > package_new.json
)

echo 应用新的package.json...
move /y package_new.json package.json >nul

echo.
echo 2. 生成Prisma客户端...
npx prisma generate

echo.
echo 3. 提交修改...
cd /d c:/Users/HP/CodeBuddy/239025009
git add .
git commit -m "修复部署问题：使用ts-node --esm直接运行TypeScript文件"

echo.
echo 4. 推送代码...
git push origin master:main

echo.
echo 修复完成！请到Render控制台重新部署。
pause