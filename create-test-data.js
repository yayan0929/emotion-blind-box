const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    // 检查是否已有管理员账号
    const adminExists = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminExists) {
      // 创建管理员账号
      const hashedPassword = await bcrypt.hash('123456', 12);
      const admin = await prisma.user.create({
        data: {
          username: 'admin',
          phone: '13800138000',
          password: hashedPassword,
          role: 'admin',
          anonymousName: 'admin_user',
          isAnonymous: true
        }
      });
      console.log('已创建管理员账号:', admin);
    } else {
      console.log('管理员账号已存在:', adminExists);
    }

    // 创建普通用户
    const hashedPassword = await bcrypt.hash('123456', 12);
    const user1 = await prisma.user.upsert({
      where: { phone: '13800138001' },
      update: {},
      create: {
        username: 'user1',
        phone: '13800138001',
        password: hashedPassword,
        role: 'user',
        anonymousName: 'anonymous_user1',
        isAnonymous: true
      }
    });

    const user2 = await prisma.user.upsert({
      where: { phone: '13800138002' },
      update: {},
      create: {
        username: 'user2',
        phone: '13800138002',
        password: hashedPassword,
        role: 'user',
        anonymousName: 'anonymous_user2',
        isAnonymous: true
      }
    });

    console.log('已创建/更新用户:', user1, user2);

    // 创建盲盒
    const box1 = await prisma.box.create({
      data: {
        content: '今天心情特别好，想和大家分享快乐！阳光明媚的一天，希望每个人都能有好心情。',
        title: '分享快乐',
        isPublic: true,
        allowReply: true,
        authorId: user1.id
      }
    });

    const box2 = await prisma.box.create({
      data: {
        content: '最近压力好大，考试临近了，感觉自己复习得不够好。有没有什么好的学习方法推荐？',
        title: '考试焦虑',
        isPublic: true,
        allowReply: true,
        authorId: user2.id
      }
    });

    console.log('已创建盲盒:', box1, box2);

    // 创建回复
    await prisma.reply.create({
      data: {
        content: '加油！考试前保持良好的心态很重要，你可以试试番茄工作法，每学习25分钟休息5分钟，这样效率会更高。',
        boxId: box2.id,
        authorId: user1.id
      }
    });

    await prisma.reply.create({
      data: {
        content: '我理解你的感受，考试焦虑很正常。建议你制定一个详细的复习计划，按部就班地复习，不要给自己太大压力。',
        boxId: box2.id,
        authorId: adminExists ? adminExists.id : user2.id
      }
    });

    console.log('已创建回复');

    // 统计数据
    const userCount = await prisma.user.count();
    const boxCount = await prisma.box.count();
    const replyCount = await prisma.reply.count();

    console.log(`\n数据统计:
- 用户数量: ${userCount}
- 盲盒数量: ${boxCount}
- 回复数量: ${replyCount}`);

    console.log('\n测试数据创建完成！');
    await prisma.$disconnect();
  } catch (error) {
    console.error('创建测试数据失败:', error);
    await prisma.$disconnect();
  }
}

createTestData();