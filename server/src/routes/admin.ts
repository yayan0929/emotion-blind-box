import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, adminMiddleware } from '@/middleware/auth'
import bcrypt from 'bcryptjs'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

const router = express.Router()
const prisma = new PrismaClient()

// 管理员登录
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      })
    }

    // 查找管理员
    const admin = await prisma.user.findFirst({
      where: {
        username,
        role: 'ADMIN',
        isActive: true
      }
    })

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '管理员账号不存在或已停用'
      })
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      })
    }

    // 记录登录日志（这里简化处理，实际应该有专门的日志表）
    console.log(`管理员 ${admin.username} 于 ${new Date().toISOString()} 登录`)

    res.json({
      success: true,
      message: '登录成功',
      data: {
        admin: {
          id: admin.id,
          username: admin.username,
          role: admin.role
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

// 获取系统统计数据
router.get('/stats', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { period = '7' } = req.query
    const days = parseInt(period as string)
    const startDate = startOfDay(subDays(new Date(), days - 1))
    const endDate = endOfDay(new Date())

    // 总体统计数据
    const [
      totalUsers,
      totalBoxes,
      totalReplies,
      totalLikes,
      newUsers,
      newBoxes,
      newReplies,
      newLikes
    ] = await Promise.all([
      // 总用户数
      prisma.user.count({
        where: { isActive: true }
      }),
      // 总盲盒数
      prisma.emotionBox.count({
        where: { status: 'ACTIVE' }
      }),
      // 总回复数
      prisma.reply.count({
        where: { status: 'ACTIVE' }
      }),
      // 总点赞数
      prisma.like.count(),
      // 新增用户数
      prisma.user.count({
        where: {
          isActive: true,
          createdAt: { gte: startDate }
        }
      }),
      // 新增盲盒数
      prisma.emotionBox.count({
        where: {
          status: 'ACTIVE',
          createdAt: { gte: startDate }
        }
      }),
      // 新增回复数
      prisma.reply.count({
        where: {
          status: 'ACTIVE',
          createdAt: { gte: startDate }
        }
      }),
      // 新增点赞数
      prisma.like.count({
        where: {
          createdAt: { gte: startDate }
        }
      })
    ])

    // 违规数据统计
    const [
      inactiveUsers,
      archivedBoxes,
      deletedReplies
    ] = await Promise.all([
      // 被冻结用户数
      prisma.user.count({
        where: { isActive: false }
      }),
      // 被下架盲盒数
      prisma.emotionBox.count({
        where: { status: 'ARCHIVED' }
      }),
      // 被删除回复数
      prisma.reply.count({
        where: { status: 'DELETED' }
      })
    ])

    // 每日数据趋势
    const dailyStats = []
    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i))
      const nextDate = endOfDay(date)
      
      const [
        dayUsers,
        dayBoxes,
        dayReplies,
        dayLikes
      ] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: { gte: date, lte: nextDate }
          }
        }),
        prisma.emotionBox.count({
          where: {
            createdAt: { gte: date, lte: nextDate }
          }
        }),
        prisma.reply.count({
          where: {
            createdAt: { gte: date, lte: nextDate }
          }
        }),
        prisma.like.count({
          where: {
            createdAt: { gte: date, lte: nextDate }
          }
        })
      ])
      
      dailyStats.push({
        date: format(date, 'yyyy-MM-dd'),
        users: dayUsers,
        boxes: dayBoxes,
        replies: dayReplies,
        likes: dayLikes
      })
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalBoxes,
          totalReplies,
          totalLikes,
          newUsers,
          newBoxes,
          newReplies,
          newLikes
        },
        violations: {
          inactiveUsers,
          archivedBoxes,
          deletedReplies
        },
        dailyStats
      }
    })
  } catch (error) {
    next(error)
  }
})

// 获取热门盲盒
router.get('/popular-boxes', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { limit = 10, period = '7' } = req.query
    const days = parseInt(period as string)
    const startDate = subDays(new Date(), days)

    const popularBoxes = await prisma.emotionBox.findMany({
      where: {
        status: 'ACTIVE',
        createdAt: { gte: startDate }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            anonymousName: true
          }
        },
        _count: {
          select: {
            views: true,
            replies: true
          }
        }
      },
      orderBy: [
        { viewCount: 'desc' },
        { replies: { _count: 'desc' } }
      ],
      take: parseInt(limit as string)
    })

    res.json({
      success: true,
      data: { boxes: popularBoxes }
    })
  } catch (error) {
    next(error)
  }
})

// 获取活跃用户
router.get('/active-users', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { limit = 10, period = '7' } = req.query
    const days = parseInt(period as string)
    const startDate = subDays(new Date(), days)

    // 获取发布盲盒活跃用户
    const activeBoxUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        boxes: {
          some: {
            createdAt: { gte: startDate }
          }
        }
      },
      include: {
        _count: {
          select: {
            boxes: {
              where: {
                createdAt: { gte: startDate }
              }
            }
          }
        }
      },
      orderBy: {
        boxes: {
          _count: 'desc'
        }
      },
      take: parseInt(limit as string)
    })

    // 获取回复活跃用户
    const activeReplyUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        replies: {
          some: {
            createdAt: { gte: startDate }
          }
        }
      },
      include: {
        _count: {
          select: {
            replies: {
              where: {
                createdAt: { gte: startDate }
              }
            }
          }
        }
      },
      orderBy: {
        replies: {
          _count: 'desc'
        }
      },
      take: parseInt(limit as string)
    })

    res.json({
      success: true,
      data: {
        boxUsers: activeBoxUsers,
        replyUsers: activeReplyUsers
      }
    })
  } catch (error) {
    next(error)
  }
})

// 获取敏感词列表
router.get('/sensitive-words', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, level } = req.query
    
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum
    
    const whereClause: any = {}
    if (level && level !== 'ALL') {
      whereClause.level = level
    }
    
    const [words, total] = await Promise.all([
      prisma.sensitiveWord.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.sensitiveWord.count({
        where: whereClause
      })
    ])
    
    res.json({
      success: true,
      data: {
        words,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

// 添加敏感词
router.post('/sensitive-words', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { word, level } = req.body
    
    if (!word || !level) {
      return res.status(400).json({
        success: false,
        message: '敏感词和级别不能为空'
      })
    }
    
    if (!['WARNING', 'BLOCK'].includes(level)) {
      return res.status(400).json({
        success: false,
        message: '级别必须是 WARNING 或 BLOCK'
      })
    }
    
    // 检查是否已存在
    const existingWord = await prisma.sensitiveWord.findUnique({
      where: { word }
    })
    
    if (existingWord) {
      return res.status(400).json({
        success: false,
        message: '敏感词已存在'
      })
    }
    
    const newWord = await prisma.sensitiveWord.create({
      data: {
        word,
        level
      }
    })
    
    res.status(201).json({
      success: true,
      message: '敏感词添加成功',
      data: { word: newWord }
    })
  } catch (error) {
    next(error)
  }
})

// 更新敏感词
router.put('/sensitive-words/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const { word, level } = req.body
    
    if (!word || !level) {
      return res.status(400).json({
        success: false,
        message: '敏感词和级别不能为空'
      })
    }
    
    if (!['WARNING', 'BLOCK'].includes(level)) {
      return res.status(400).json({
        success: false,
        message: '级别必须是 WARNING 或 BLOCK'
      })
    }
    
    // 检查敏感词是否存在
    const existingWord = await prisma.sensitiveWord.findUnique({
      where: { id }
    })
    
    if (!existingWord) {
      return res.status(404).json({
        success: false,
        message: '敏感词不存在'
      })
    }
    
    // 如果单词发生变化，检查新单词是否已存在
    if (word !== existingWord.word) {
      const duplicateWord = await prisma.sensitiveWord.findUnique({
        where: { word }
      })
      
      if (duplicateWord) {
        return res.status(400).json({
          success: false,
          message: '敏感词已存在'
        })
      }
    }
    
    const updatedWord = await prisma.sensitiveWord.update({
      where: { id },
      data: {
        word,
        level
      }
    })
    
    res.json({
      success: true,
      message: '敏感词更新成功',
      data: { word: updatedWord }
    })
  } catch (error) {
    next(error)
  }
})

// 删除敏感词
router.delete('/sensitive-words/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    
    const word = await prisma.sensitiveWord.findUnique({
      where: { id }
    })
    
    if (!word) {
      return res.status(404).json({
        success: false,
        message: '敏感词不存在'
      })
    }
    
    await prisma.sensitiveWord.delete({
      where: { id }
    })
    
    res.json({
      success: true,
      message: '敏感词删除成功'
    })
  } catch (error) {
    next(error)
  }
})

// 获取用户列表
router.get('/users', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, keyword, role, isActive } = req.query
    
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum
    
    const whereClause: any = {}
    
    if (keyword) {
      whereClause.OR = [
        { username: { contains: keyword as string } },
        { phone: { contains: keyword as string } },
        { studentId: { contains: keyword as string } }
      ]
    }
    
    if (role && role !== 'ALL') {
      whereClause.role = role
    }
    
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true'
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          username: true,
          phone: true,
          studentId: true,
          school: true,
          grade: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              boxes: true,
              replies: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.user.count({ where: whereClause })
    ])
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

// 更新用户状态
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const { isActive, role } = req.body
    
    if (isActive === undefined && !role) {
      return res.status(400).json({
        success: false,
        message: '请提供要更新的字段'
      })
    }
    
    const updateData: any = {}
    if (isActive !== undefined) updateData.isActive = isActive
    if (role) updateData.role = role
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    })
    
    res.json({
      success: true,
      message: '用户更新成功',
      data: { user: updatedUser }
    })
  } catch (error) {
    next(error)
  }
})

// 更新用户状态（单独路由）
router.put('/users/:id/status', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const { isActive } = req.body
    
    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: '请提供用户状态'
      })
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        username: true,
        phone: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    })
    
    res.json({
      success: true,
      message: `用户已${isActive ? '激活' : '冻结'}`,
      data: { user: updatedUser }
    })
  } catch (error) {
    next(error)
  }
})

// 删除用户
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    
    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }
    
    // 删除用户（级联删除相关数据）
    await prisma.user.delete({
      where: { id }
    })
    
    res.json({
      success: true,
      message: '用户已删除'
    })
  } catch (error) {
    next(error)
  }
})

// 获取盲盒列表
router.get('/boxes', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, keyword, status, authorId } = req.query
    
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum
    
    const whereClause: any = {}
    
    if (keyword) {
      whereClause.OR = [
        { title: { contains: keyword as string } },
        { content: { contains: keyword as string } }
      ]
    }
    
    if (status && status !== 'ALL') {
      whereClause.status = status
    }
    
    if (authorId) {
      whereClause.userId = authorId
    }
    
    const [boxes, total] = await Promise.all([
      prisma.emotionBox.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              anonymousName: true,
              isAnonymous: true
            }
          },
          _count: {
            select: {
              replies: true,
              views: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.emotionBox.count({ where: whereClause })
    ])
    
    res.json({
      success: true,
      data: {
        boxes,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

// 更新盲盒状态
router.put('/boxes/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, isFeatured } = req.body
    
    if (status === undefined && isFeatured === undefined) {
      return res.status(400).json({
        success: false,
        message: '请提供要更新的字段'
      })
    }
    
    const updateData: any = {}
    if (status) updateData.status = status
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured
    
    const updatedBox = await prisma.emotionBox.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            anonymousName: true,
            isAnonymous: true
          }
        }
      }
    })
    
    res.json({
      success: true,
      message: '盲盒更新成功',
      data: { box: updatedBox }
    })
  } catch (error) {
    next(error)
  }
})

// 设置盲盒精选状态
router.put('/boxes/:id/featured', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const { isFeatured } = req.body
    
    if (isFeatured === undefined) {
      return res.status(400).json({
        success: false,
        message: '请提供精选状态'
      })
    }
    
    const updatedBox = await prisma.emotionBox.update({
      where: { id },
      data: { isFeatured },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            anonymousName: true,
            isAnonymous: true
          }
        }
      }
    })
    
    res.json({
      success: true,
      message: `盲盒已${isFeatured ? '设为精选' : '取消精选'}`,
      data: { box: updatedBox }
    })
  } catch (error) {
    next(error)
  }
})

// 下架盲盒
router.put('/boxes/:id/archive', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    
    const updatedBox = await prisma.emotionBox.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            anonymousName: true,
            isAnonymous: true
          }
        }
      }
    })
    
    res.json({
      success: true,
      message: '盲盒已下架',
      data: { box: updatedBox }
    })
  } catch (error) {
    next(error)
  }
})

// 删除盲盒
router.delete('/boxes/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    
    // 检查盲盒是否存在
    const box = await prisma.emotionBox.findUnique({
      where: { id }
    })
    
    if (!box) {
      return res.status(404).json({
        success: false,
        message: '盲盒不存在'
      })
    }
    
    // 删除盲盒（级联删除相关数据）
    await prisma.emotionBox.delete({
      where: { id }
    })
    
    res.json({
      success: true,
      message: '盲盒已删除'
    })
  } catch (error) {
    next(error)
  }
})

// 获取回复列表
router.get('/replies', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, keyword, status, boxId, authorId } = req.query
    
    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum
    
    const whereClause: any = {}
    
    if (keyword) {
      whereClause.content = { contains: keyword as string }
    }
    
    if (status && status !== 'ALL') {
      whereClause.status = status
    }
    
    if (boxId) {
      whereClause.boxId = boxId
    }
    
    if (authorId) {
      whereClause.userId = authorId
    }
    
    const [replies, total] = await Promise.all([
      prisma.reply.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              anonymousName: true,
              isAnonymous: true
            }
          },
          box: {
            select: {
              id: true,
              title: true
            }
          },
          _count: {
            select: {
              likes: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.reply.count({ where: whereClause })
    ])
    
    res.json({
      success: true,
      data: {
        replies,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

// 更新回复状态
router.put('/replies/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: '请提供要更新的状态'
      })
    }
    
    const updatedReply = await prisma.reply.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            anonymousName: true,
            isAnonymous: true
          }
        },
        box: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })
    
    res.json({
      success: true,
      message: '回复更新成功',
      data: { reply: updatedReply }
    })
  } catch (error) {
    next(error)
  }
})

// 删除回复
router.delete('/replies/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    
    // 检查回复是否存在
    const reply = await prisma.reply.findUnique({
      where: { id }
    })
    
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: '回复不存在'
      })
    }
    
    // 删除回复（级联删除相关点赞数据）
    await prisma.reply.delete({
      where: { id }
    })
    
    res.json({
      success: true,
      message: '回复已删除'
    })
  } catch (error) {
    next(error)
  }
})

// 获取系统设置
router.get('/settings', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { settingKey: 'asc' }
    })
    
    res.json({
      success: true,
      data: settings
    })
  } catch (error) {
    next(error)
  }
})

// 更新系统设置
router.put('/settings', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const settings = req.body
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: '请提供有效的设置数据'
      })
    }
    
    // 批量更新设置
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      return prisma.systemSetting.upsert({
        where: { settingKey: key },
        update: { settingValue: String(value) },
        create: { settingKey: key, settingValue: String(value) }
      })
    })
    
    await Promise.all(updatePromises)
    
    res.json({
      success: true,
      message: '系统设置更新成功'
    })
  } catch (error) {
    next(error)
  }
})

// 获取单个设置
router.get('/settings/:key', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { key } = req.params
    
    const setting = await prisma.systemSetting.findUnique({
      where: { settingKey: key }
    })
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: '设置不存在'
      })
    }
    
    res.json({
      success: true,
      data: { [key]: setting.settingValue }
    })
  } catch (error) {
    next(error)
  }
})

// 更新单个设置
router.put('/settings/:key', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { key } = req.params
    const { value } = req.body
    
    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: '请提供设置值'
      })
    }
    
    const setting = await prisma.systemSetting.upsert({
      where: { settingKey: key },
      update: { settingValue: String(value) },
      create: { settingKey: key, settingValue: String(value) }
    })
    
    res.json({
      success: true,
      message: '设置更新成功',
      data: { setting }
    })
  } catch (error) {
    next(error)
  }
})

// 重置系统设置
router.post('/settings/reset', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    // 删除所有设置
    await prisma.systemSetting.deleteMany({})
    
    // 创建默认设置
    const defaultSettings = [
      { settingKey: 'SITE_NAME', settingValue: '情绪盲盒' },
      { settingKey: 'SITE_DESCRIPTION', settingValue: '分享情绪，传递温暖' },
      { settingKey: 'ALLOW_ANONYMOUS', settingValue: 'true' },
      { settingKey: 'REQUIRE_APPROVAL', settingValue: 'false' },
      { settingKey: 'MAX_DAILY_BOXES', settingValue: '5' },
      { settingKey: 'MIN_REPLY_INTERVAL', settingValue: '30' }
    ]
    
    await prisma.systemSetting.createMany({
      data: defaultSettings
    })
    
    res.json({
      success: true,
      message: '系统设置已重置为默认值'
    })
  } catch (error) {
    next(error)
  }
})

// 备份数据
router.post('/settings/backup', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    // 获取所有需要备份的数据
    const [users, boxes, replies, likes, settings] = await Promise.all([
      prisma.user.findMany(),
      prisma.emotionBox.findMany(),
      prisma.reply.findMany(),
      prisma.like.findMany(),
      prisma.systemSetting.findMany()
    ])
    
    const backupData = {
      timestamp: new Date().toISOString(),
      data: {
        users,
        boxes,
        replies,
        likes,
        settings
      }
    }
    
    // 在实际应用中，这里应该保存到文件或云存储
    // 这里只返回备份的数据
    res.json({
      success: true,
      message: '数据备份成功',
      data: backupData
    })
  } catch (error) {
    next(error)
  }
})

export default router