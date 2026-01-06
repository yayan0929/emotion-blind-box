const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestData() {
  console.log('开始创建测试数据...');

  try {
    // 获取管理员账号
    const admin = await prisma.user.findUnique({
      where: { phone: '13800000000' }
    });

    if (!admin) {
      console.log('管理员账号不存在，请先运行 init-db.js');
      return;
    }

    // 创建测试盲盒
    const testBoxes = [
      {
        title: '期末考试的压力',
        content: '最近期末考试压力好大，感觉复习不完，每天都很焦虑。不知道大家是怎么调整状态的？',
        userId: admin.id,
        isPublic: true,
        allowReply: true,
        status: 'ACTIVE'
      },
      {
        title: '找不到实习的烦恼',
        content: '找了一个月实习了，还是没有合适的offer，感觉自己什么都不会，很迷茫。',
        userId: admin.id,
        isPublic: true,
        allowReply: true,
        status: 'ACTIVE'
      },
      {
        title: '宿舍关系紧张',
        content: '和室友的关系最近很紧张，因为一些小事经常吵架，感觉宿舍气氛很压抑，不知道该怎么处理。',
        userId: admin.id,
        isPublic: true,
        allowReply: true,
        status: 'ACTIVE'
      },
      {
        title: '社团活动和学习平衡',
        content: '参加了两个社团，活动很多，最近感觉学习跟不上了，不知道该如何平衡社团活动和学习。',
        userId: admin.id,
        isPublic: true,
        allowReply: true,
        status: 'ACTIVE'
      },
      {
        title: '想家的心情',
        content: '第一次离家的第一个学期，虽然大学生活很精彩，但还是常常想家，特别是晚上一个人的时候。',
        userId: admin.id,
        isPublic: true,
        allowReply: true,
        status: 'ACTIVE'
      }
    ];

    for (const box of testBoxes) {
      await prisma.emotionBox.create({
        data: box
      });
    }

    console.log(`成功创建 ${testBoxes.length} 个测试盲盒`);

    // 创建一些回复
    const boxes = await prisma.emotionBox.findMany({
      take: 3
    });

    for (const box of boxes) {
      await prisma.reply.create({
        data: {
          boxId: box.id,
          userId: admin.id,
          content: '我理解你的感受，试着调整一下心态，一切都会好起来的。',
          status: 'ACTIVE'
        }
      });
    }

    console.log('成功创建测试回复');

    console.log('测试数据创建完成！');
  } catch (error) {
    console.error('创建测试数据失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();