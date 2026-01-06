@echo off
echo 修复 Prisma 客户端问题...

cd /d %~dp0

echo 1. 清理可能损坏的 Prisma 缓存...
if exist node_modules\.prisma rmdir /s /q node_modules\.prisma

echo 2. 重新安装 Prisma...
call npm install prisma @prisma/client

echo 3. 生成 Prisma 客户端...
call npx prisma generate

echo 4. 确认客户端生成结果...
if exist node_modules\.prisma\client (
    echo Prisma 客户端已成功生成！
) else (
    echo 警告：Prisma 客户端可能未正确生成
)

echo 5. 创建数据库...
call npx prisma db push

echo 6. 初始化基础数据...
call node init-db.js

echo 修复完成！
pause