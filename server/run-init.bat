@echo off
echo 正在初始化数据库...

cd /d %~dp0

echo 1. 生成 Prisma 客户端...
call npx prisma generate

echo 2. 创建数据库...
call npx prisma db push

echo 3. 初始化基础数据...
call node init-db.js

echo 数据库初始化完成！
pause