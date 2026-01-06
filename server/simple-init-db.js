const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath);

async function main() {
  console.log('开始初始化数据库...');
  
  // 创建管理员账号
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  await new Promise((resolve, reject) => {
    db.run(`INSERT OR REPLACE INTO users (id, username, phone, password, role, isActive, anonymousName, isAnonymous, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      'admin-id',
      'admin',
      '13800000000',
      adminPassword,
      'ADMIN',
      1,
      '系统管理员',
      0,
      new Date().toISOString(),
      new Date().toISOString()
    ], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  
  console.log('管理员账号创建完成: admin');

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
    await new Promise((resolve, reject) => {
      db.run(`INSERT OR REPLACE INTO system_settings (id, settingKey, settingValue, description) 
              VALUES (?, ?, ?, ?)`, [
        setting.settingKey + '-id',
        setting.settingKey,
        setting.settingValue,
        setting.description
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
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
    await new Promise((resolve, reject) => {
      db.run(`INSERT OR REPLACE INTO sensitive_words (id, word, level, createdAt) 
              VALUES (?, ?, ?, ?)`, [
        word.word + '-id',
        word.word,
        word.level,
        new Date().toISOString()
      ], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  console.log('敏感词库创建完成');

  // 创建上传目录
  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('上传目录创建完成');
  }

  console.log('数据库初始化完成！');
  db.close();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });