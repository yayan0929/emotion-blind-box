@echo off
chcp 65001
echo ========================================
echo 大学生情绪盲盒交换站 - 一键部署到Render
echo ========================================
echo.
echo 第一步：初始化Git仓库...
git add .
git commit -m "准备部署到Render平台"
echo ✓ Git提交完成
echo.
echo 第二步：推送到GitHub...
git push origin main
echo ✓ 代码已推送到GitHub
echo.
echo 第三步：部署说明...
echo 请按照以下步骤在Render上创建服务：
echo 1. 创建PostgreSQL数据库 (emotion-blind-box-db)
echo 2. 创建后端API服务 (emotion-blind-box-api)
echo 3. 创建前端静态站点 (emotion-blind-box-client)
echo 4. 配置环境变量
echo 5. 运行数据库迁移
echo.
echo 详细步骤请参考 "最终部署指南.md"
echo.
pause