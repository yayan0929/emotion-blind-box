const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== 用户数量 ===');
    const userCount = await prisma.user.count();
    console.log('总用户数:', userCount);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          phone: true,
          role: true,
          isActive: true
        },
        take: 5
      });
      console.log('前5个用户:', users);
    }
    
    console.log('\n=== 盲盒数量 ===');
    const boxCount = await prisma.box.count();
    console.log('总盲盒数:', boxCount);
    
    if (boxCount > 0) {
      const boxes = await prisma.box.findMany({
        select: {
          id: true,
          title: true,
          content: true,
          authorId: true
        },
        take: 3
      });
      console.log('前3个盲盒:', boxes);
    }
    
    console.log('\n=== 回复数量 ===');
    const replyCount = await prisma.reply.count();
    console.log('总回复数:', replyCount);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('查询失败:', error);
  }
}

checkDatabase();