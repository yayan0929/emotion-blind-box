const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 创建管理员账号
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '13800000000' },
    update: {},
    create: {
      username: 'admin',
      phone: '13800000000',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      anonymousName: '系统管理员',
    },
  });

  console.log('管理员账号创建完成:', admin.username);

  // 创建系统设置
  const settings = [
    { settingKey: 'siteName', settingValue: '大学生情绪盲盒交换站', description: '网站名称' },
    { settingKey: 'siteDescription', settingValue: '一个面向大学生群体的匿名情绪互助平台', description: '网站描述' },
    { settingKey: 'allowRegistration', settingValue: 'true', description: '是否允许用户注册' },
    { settingKey: 'dailyBoxLimit', settingValue: '3', description: '每日盲盒发布限制' },
    { settingKey: 'autoFeaturedThreshold', settingValue: '5', description: '自动精选盲盒的点赞数阈值' },
    { settingKey: 'maxImageCount', settingValue: '5', description: '单个盲盒最大图片数量' },
    { settingKey: 'maxImageSize', settingValue: '5242880', description: '单张图片最大大小(字节)' },
    { settingKey: 'userAgreement', settingValue: '欢迎使用大学生情绪盲盒交换站！请遵守社区规则，友善交流，互相支持。', description: '用户协议' },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { settingKey: setting.settingKey },
      update: { settingValue: setting.settingValue },
      create: setting,
    });
  }

  console.log('系统设置创建完成');

  // 创建敏感词库
  const sensitiveWords = [
    { word: '傻逼', level: 'BLOCK' },
    { word: '草泥马', level: 'BLOCK' },
    { word: '妈的', level: 'WARNING' },
    { word: '死', level: 'WARNING' },
    { word: '杀', level: 'WARNING' },
    { word: '暴力', level: 'WARNING' },
    { word: '自杀', level: 'BLOCK' },
    { word: '自残', level: 'WARNING' },
    { word: '赌博', level: 'BLOCK' },
    { word: '毒品', level: 'BLOCK' },
    { word: '色情', level: 'BLOCK' },
  ];

  for (const word of sensitiveWords) {
    await prisma.sensitiveWord.upsert({
      where: { word: word.word },
      update: {},
      create: word,
    });
  }

  console.log('敏感词库创建完成');

  // 创建上传目录
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('上传目录创建完成');
  }

  console.log('数据库初始化完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });