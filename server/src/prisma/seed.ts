import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始数据库初始化...')

  // 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { phone: '13800000000' },
    update: {},
    create: {
      username: 'admin',
      phone: '13800000000',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      anonymousName: '管理员'
    }
  })

  console.log('管理员账号创建成功:', admin)

  // 创建测试用户
  const testUserPassword = await bcrypt.hash('test123', 12)
  
  const testUser = await prisma.user.upsert({
    where: { phone: '13800000001' },
    update: {},
    create: {
      username: 'testuser',
      phone: '13800000001',
      studentId: '20210001',
      school: '示例大学',
      grade: '大三',
      password: testUserPassword,
      role: 'USER',
      isActive: true,
      anonymousName: '快乐小熊123'
    }
  })

  console.log('测试用户创建成功:', testUser)

  // 创建系统设置
  const defaultSettings = [
    {
      settingKey: 'siteName',
      settingValue: '大学生情绪盲盒交换站',
      description: '网站名称'
    },
    {
      settingKey: 'siteDescription',
      settingValue: '一个面向大学生群体的匿名情绪互助平台',
      description: '网站描述'
    },
    {
      settingKey: 'allowRegister',
      settingValue: 'true',
      description: '是否允许注册'
    },
    {
      settingKey: 'requireStudentId',
      settingValue: 'false',
      description: '是否必须填写学号'
    },
    {
      settingKey: 'maxImagesPerBox',
      settingValue: '3',
      description: '每个盲盒最大图片数量'
    },
    {
      settingKey: 'maxImageSize',
      settingValue: '5242880',
      description: '单张图片最大大小(字节)'
    },
    {
      settingKey: 'allowAnonymousView',
      settingValue: 'true',
      description: '是否允许匿名查看'
    },
    {
      settingKey: 'allowBoxDelete',
      settingValue: 'true',
      description: '是否允许删除盲盒'
    },
    {
      settingKey: 'violationRules',
      settingValue: '请遵守平台规则，禁止发布违法违规、色情低俗、人身攻击等内容',
      description: '违规规则'
    },
    {
      settingKey: 'autoFeaturedThreshold',
      settingValue: '5',
      description: '自动精选阈值(点赞数)'
    },
    {
      settingKey: 'dailyBoxLimit',
      settingValue: '3',
      description: '每日发布盲盒限制'
    },
    {
      settingKey: 'maintenanceMode',
      settingValue: 'false',
      description: '维护模式'
    },
    {
      settingKey: 'maintenanceMessage',
      settingValue: '系统维护中，请稍后再试',
      description: '维护模式提示信息'
    }
  ]

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { settingKey: setting.settingKey },
      update: {
        settingValue: setting.settingValue
      },
      create: setting
    })
  }

  console.log('系统设置初始化完成')

  // 创建敏感词
  const sensitiveWords = [
    { word: '傻逼', level: 'BLOCK' },
    { word: '他妈的', level: 'WARNING' },
    { word: '操你妈', level: 'BLOCK' },
    { word: '草', level: 'WARNING' },
    { word: '傻B', level: 'BLOCK' },
    { word: 'SB', level: 'BLOCK' }
  ]

  for (const word of sensitiveWords) {
    await prisma.sensitiveWord.upsert({
      where: { word: word.word },
      update: {
        level: word.level
      },
      create: word
    })
  }

  console.log('敏感词库初始化完成')

  // 创建测试盲盒
  const testBoxes = [
    {
      userId: testUser.id,
      title: '考试焦虑',
      content: '最近期末考试要到了，感觉压力好大，复习不进去，怎么办啊？感觉这个学期要挂科了，很焦虑。有没有什么好的复习方法推荐？',
      images: '[]',
      isPublic: true,
      allowReply: true
    },
    {
      userId: testUser.id,
      title: '社团活动的烦恼',
      content: '最近在社团遇到了一些问题，作为负责人，我需要协调各个部门，但感觉大家都不配合，活动进展缓慢。我已经很努力了，但还是有种挫败感。',
      images: '[]',
      isPublic: true,
      allowReply: true
    },
    {
      userId: testUser.id,
      title: '寝室关系的困惑',
      content: '和室友相处得不是很愉快，生活习惯差异太大，又不好意思说，每天心情都很压抑。不知道该不该换个寝室，或者有什么好的相处方式吗？',
      images: '[]',
      isPublic: true,
      allowReply: true
    }
  ]

  for (const box of testBoxes) {
    await prisma.emotionBox.create({
      data: box
    })
  }

  console.log('测试盲盒创建完成')

  // 创建测试回复
  const boxes = await prisma.emotionBox.findMany({
    take: 3
  })

  const testReplies = [
    {
      boxId: boxes[0]?.id,
      userId: admin.id,
      content: '考试焦虑是很正常的情况，不要过度担心。建议你制定一个详细的复习计划，把重点内容先列出来，然后每天按照计划复习。适当的放松也很重要，可以听听音乐或者做做运动。加油！'
    },
    {
      boxId: boxes[0]?.id,
      userId: testUser.id,
      content: '我去年也有同样的经历，后来找了几个同学一起复习，互相督促，效果很好。你也可以试试看，找到志同道合的小伙伴一起学习。'
    },
    {
      boxId: boxes[1]?.id,
      userId: admin.id,
      content: '作为社团负责人确实不容易，你已经很棒了。可以尝试开个会议，把大家聚在一起，明确每个人的职责，并设定一些小目标和奖励机制，激励大家积极参与。'
    },
    {
      boxId: boxes[2]?.id,
      userId: testUser.id,
      content: '寝室关系确实是个大问题，建议找个合适的时间和室友好好沟通一下，坦诚地表达你的想法。如果实在无法调和，可以考虑向辅导员申请调换寝室。'
    }
  ]

  for (const reply of testReplies) {
    await prisma.reply.create({
      data: reply
    })
  }

  console.log('测试回复创建完成')

  console.log('数据库初始化完成！')
  console.log('管理员账号: 13800000000 / admin123')
  console.log('测试用户账号: 13800000001 / test123')
}

main()
  .catch((e) => {
    console.error('数据库初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })