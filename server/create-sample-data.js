import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSampleData() {
  try {
    console.log('创建示例数据...');

    // 检查是否已有管理员账号
    const adminExists = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    let adminId;
    if (!adminExists) {
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
      adminId = admin.id;
      console.log('已创建管理员账号:', admin);
    } else {
      adminId = adminExists.id;
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
        anonymousName: '阳光小王子',
        isAnonymous: true,
        school: '清华大学',
        grade: '大二'
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
        anonymousName: '月亮公主',
        isAnonymous: true,
        school: '北京大学',
        grade: '大三'
      }
    });

    const user3 = await prisma.user.upsert({
      where: { phone: '13800138003' },
      update: {},
      create: {
        username: 'user3',
        phone: '13800138003',
        password: hashedPassword,
        role: 'user',
        anonymousName: '星空探险家',
        isAnonymous: true,
        school: '复旦大学',
        grade: '大一'
      }
    });

    console.log('已创建/更新用户:', user1.username, user2.username, user3.username);

    // 创建盲盒
    const box1 = await prisma.emotionBox.create({
      data: {
        content: '今天心情特别好，想和大家分享快乐！阳光明媚的一天，希望每个人都能有好心情。即使有困难，也要保持微笑面对，因为生活总是充满希望的。',
        title: '分享快乐',
        isPublic: true,
        allowReply: true,
        status: 'ACTIVE',
        userId: user1.id
      }
    });

    const box2 = await prisma.emotionBox.create({
      data: {
        content: '最近压力好大，考试临近了，感觉自己复习得不够好。有没有什么好的学习方法推荐？有时候真的怀疑自己的能力，但又不想放弃。',
        title: '考试焦虑',
        isPublic: true,
        allowReply: true,
        status: 'ACTIVE',
        userId: user2.id
      }
    });

    const box3 = await prisma.emotionBox.create({
      data: {
        content: '宿舍关系真的好复杂，有时候想一个人静静，但又怕被孤立。大学生活真的是一个小社会，处理人际关系比学习还难。',
        title: '人际关系烦恼',
        isPublic: true,
        allowReply: true,
        status: 'ACTIVE',
        userId: user3.id
      }
    });

    const box4 = await prisma.emotionBox.create({
      data: {
        content: '今天看到一个很有趣的视频，想和大家分享一下。生活就是这样，总有一些小确幸让我们感到快乐。',
        title: '生活中的小确幸',
        isPublic: true,
        allowReply: true,
        status: 'ACTIVE',
        userId: user1.id
      }
    });

    console.log('已创建盲盒:', box1.title, box2.title, box3.title, box4.title);

    // 创建回复
    const reply1 = await prisma.reply.create({
      data: {
        content: '加油！考试前保持良好的心态很重要，你可以试试番茄工作法，每学习25分钟休息5分钟，这样效率会更高。相信自己，你一定可以的！',
        status: 'ACTIVE',
        boxId: box2.id,
        userId: user1.id
      }
    });

    const reply2 = await prisma.reply.create({
      data: {
        content: '我理解你的感受，考试焦虑很正常。建议你制定一个详细的复习计划，按部就班地复习，不要给自己太大压力。适当的放松也是必要的。',
        status: 'ACTIVE',
        boxId: box2.id,
        userId: adminId
      }
    });

    const reply3 = await prisma.reply.create({
      data: {
        content: '宿舍关系确实需要好好处理，建议你可以主动沟通，找个合适的时间和室友们聊聊。或者可以多参加一些社团活动，认识更多的朋友。',
        status: 'ACTIVE',
        boxId: box3.id,
        userId: user2.id
      }
    });

    const reply4 = await prisma.reply.create({
      data: {
        content: '分享快乐是一件很美好的事情！我也很喜欢这种积极向上的态度。希望你能一直保持这种好心情，感染更多的人！',
        status: 'ACTIVE',
        boxId: box1.id,
        userId: user3.id
      }
    });

    console.log('已创建回复:', '对"考试焦虑"的回复', '对"人际关系烦恼"的回复', '对"分享快乐"的回复');

    // 创建一些点赞
    await prisma.like.create({
      data: {
        replyId: reply1.id,
        userId: user3.id
      }
    });

    await prisma.like.create({
      data: {
        replyId: reply1.id,
        userId: user2.id
      }
    });

    await prisma.like.create({
      data: {
        replyId: reply3.id,
        userId: user1.id
      }
    });

    await prisma.like.create({
      data: {
        replyId: reply4.id,
        userId: user2.id
      }
    });

    console.log('已创建点赞记录');

    // 添加一些敏感词
    const sensitiveWords = [
      { word: '垃圾', level: 'WARNING' },
      { word: '死', level: 'BLOCK' },
      { word: '杀', level: 'BLOCK' }
    ];

    for (const word of sensitiveWords) {
      await prisma.sensitiveWord.upsert({
        where: { word: word.word },
        update: {},
        create: word
      });
    }

    console.log('已添加敏感词');

    // 添加一些系统设置
    await prisma.systemSetting.upsert({
      where: { settingKey: 'DAILY_RECOMMEND_LIMIT' },
      update: {},
      create: {
        settingKey: 'DAILY_RECOMMEND_LIMIT',
        settingValue: '10',
        description: '每日推荐盲盒数量限制'
      }
    });

    console.log('已添加系统设置');

    // 统计数据
    const userCount = await prisma.user.count();
    const boxCount = await prisma.emotionBox.count();
    const replyCount = await prisma.reply.count();
    const likeCount = await prisma.like.count();

    console.log(`\n数据统计:
- 用户数量: ${userCount}
- 盲盒数量: ${boxCount}
- 回复数量: ${replyCount}
- 点赞数量: ${likeCount}`);

    console.log('\n示例数据创建完成！');
    await prisma.$disconnect();
  } catch (error) {
    console.error('创建示例数据失败:', error);
    await prisma.$disconnect();
  }
}

createSampleData();