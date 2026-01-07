@echo off
chcp 65001 >nul
echo 简单修复方案...
cd /d c:/Users/HP/CodeBuddy/239025009

echo.
echo 1. 修改package.json文件
cd server
echo 正在备份原始package.json...
copy package.json package.json.backup

echo 正在修改启动命令...
echo { > new_package.json
echo   "name": "emotion-blind-box-server", >> new_package.json
echo   "version": "1.0.0", >> new_package.json
echo   "description": "大学生情绪盲盒交换站 - 后端API服务", >> new_package.json
echo   "main": "dist/index.js", >> new_package.json
echo   "scripts": { >> new_package.json
echo     "prestart": "npm install --production=false && npx prisma generate", >> new_package.json
echo     "dev": "tsx watch src/index.ts", >> new_package.json
echo     "build": "tsc", >> new_package.json
echo     "start": "ts-node --esm src/index.ts", >> new_package.json
echo     "db:migrate": "prisma migrate deploy", >> new_package.json
echo     "db:generate": "prisma generate", >> new_package.json
echo     "db:seed": "ts-node src/prisma/seed.ts", >> new_package.json
echo     "db:studio": "prisma studio" >> new_package.json
echo   }, >> new_package.json
echo   "type": "commonjs", >> new_package.json
echo   "dependencies": { >> new_package.json
echo     "express": "^4.18.2", >> new_package.json
echo     "cors": "^2.8.5", >> new_package.json
echo     "helmet": "^7.0.0", >> new_package.json
echo     "morgan": "^1.10.0", >> new_package.json
echo     "bcryptjs": "^2.4.3", >> new_package.json
echo     "jsonwebtoken": "^9.0.2", >> new_package.json
echo     "prisma": "^5.2.0", >> new_package.json
echo     "@prisma/client": "^5.2.0", >> new_package.json
echo     "joi": "^17.9.2", >> new_package.json
echo     "multer": "^1.4.5-lts.1", >> new_package.json
echo     "nodemailer": "^6.9.4", >> new_package.json
echo     "uuid": "^9.0.0", >> new_package.json
echo     "express-rate-limit": "^6.10.0", >> new_package.json
echo     "compression": "^1.7.4", >> new_package.json
echo     "dotenv": "^16.3.1", >> new_package.json
echo     "date-fns": "^2.30.0", >> new_package.json
echo     "tsx": "^3.12.7", >> new_package.json
echo     "ts-node": "^10.9.1" >> new_package.json
echo   }, >> new_package.json
echo   "devDependencies": { >> new_package.json
echo     "@types/express": "^4.17.17", >> new_package.json
echo     "@types/cors": "^2.8.13", >> new_package.json
echo     "@types/morgan": "^1.9.4", >> new_package.json
echo     "@types/bcryptjs": "^2.4.2", >> new_package.json
echo     "@types/jsonwebtoken": "^9.0.2", >> new_package.json
echo     "@types/multer": "^1.4.7", >> new_package.json
echo     "@types/nodemailer": "^6.4.9", >> new_package.json
echo     "@types/uuid": "^9.0.2", >> new_package.json
echo     "@types/compression": "^1.7.2", >> new_package.json
echo     "@types/node": "^20.5.0", >> new_package.json
echo     "typescript": "^5.1.6", >> new_package.json
echo     "tsx": "^3.12.7" >> new_package.json
echo   } >> new_package.json
echo } >> new_package.json

echo 替换package.json...
move /y new_package.json package.json

echo.
echo 2. 生成Prisma客户端
npx prisma generate

echo.
echo 3. 提交修改
cd /d c:/Users/HP/CodeBuddy/239025009
git add .
git commit -m "修复部署问题：使用ts-node --esm直接运行"

echo.
echo 4. 推送代码
git push origin master:main

echo.
echo 修复完成！
pause