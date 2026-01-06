import express from 'express'
import { PrismaClient, ReplyStatus } from '@prisma/client'
import { authMiddleware } from '@/middleware/auth'
import { adminMiddleware } from '@/middleware/auth'
import { checkSensitiveContent } from '@/utils/helpers'

const router = express.Router()
const prisma = new PrismaClient()

// 创建回复
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).userId
    const { boxId, content } = req.body

    if (!boxId || !content) {
      return res.status(400).json({
        success: false,
        message: '盲盒ID和内容不能为空'
      })
    }

    // 查找盲盒
    const box = await prisma.emotionBox.findUnique({
      where: { id: boxId }
    })

    if (!box) {
      return res.status(404).json({
        success: false,
        message: '盲盒不存在'
      })
    }

    if (box.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        message: '盲盒不可用'
      })
    }

    if (!box.allowReply) {
      return res.status(400).json({
        success: false,
        message: '该盲盒不允许回复'
      })
    }

    // 检查用户是否已回复过该盲盒
    const existingReply = await prisma.reply.findFirst({
      where: {
        boxId,
        userId,
        status: "ACTIVE"
      }
    })

    if (existingReply) {
      return res.status(400).json({
        success: false,
        message: '您已回复过该盲盒'
      })
    }

    // 检查敏感词
    const sensitiveCheck = await checkSensitiveContent(content)
    
    if (sensitiveCheck.isBlocked) {
      return res.status(400).json({
        success: false,
        message: '回复内容包含敏感信息，请修改后重试'
      })
    }

    // 创建回复
    const newReply = await prisma.reply.create({
      data: {
        boxId,
        userId,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            anonymousName: true,
            isAnonymous: true
          }
        },
        _count: {
          select: {
            likes: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      message: '回复成功',
      data: { reply: newReply }
    })
  } catch (error) {
    next(error)
  }
})

// 删除回复
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = (req as any).userId

    // 查找回复
    const reply = await prisma.reply.findUnique({
      where: { id }
    })

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: '回复不存在'
      })
    }

    // 检查权限
    if (reply.userId !== userId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      })

      if (currentUser?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: '无权删除该回复'
        })
      }
    }

    // 软删除回复
    await prisma.reply.update({
      where: { id },
      data: { status: "DELETED" }
    })

    res.json({
      success: true,
      message: '回复已删除'
    })
  } catch (error) {
    next(error)
  }
})

// 点赞/取消点赞回复
router.post('/:id/like', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = (req as any).userId

    // 查找回复
    const reply = await prisma.reply.findUnique({
      where: { id }
    })

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: '回复不存在'
      })
    }

    if (reply.status !== "ACTIVE") {
      return res.status(404).json({
        success: false,
        message: '回复不可用'
      })
    }

    // 查找是否已点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        replyId_userId: {
          replyId: id,
          userId
        }
      }
    })

    if (existingLike) {
      // 取消点赞
      await prisma.like.delete({
        where: { id: existingLike.id }
      })

      // 更新点赞数
      await prisma.reply.update({
        where: { id },
        data: {
          likeCount: {
            decrement: 1
          }
        }
      })

      res.json({
        success: true,
        message: '已取消点赞',
        data: { liked: false }
      })
    } else {
      // 添加点赞
      await prisma.like.create({
        data: {
          replyId: id,
          userId
        }
      })

      // 更新点赞数
      await prisma.reply.update({
        where: { id },
        data: {
          likeCount: {
            increment: 1
          }
        }
      })

      res.json({
        success: true,
        message: '点赞成功',
        data: { liked: true }
      })
    }
  } catch (error) {
    next(error)
  }
})

// 获取回复点赞状态
router.get('/:id/like-status', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = (req as any).userId

    // 查找是否已点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        replyId_userId: {
          replyId: id,
          userId
        }
      }
    })

    res.json({
      success: true,
      data: { liked: !!existingLike }
    })
  } catch (error) {
    next(error)
  }
})

// 管理员获取回复列表
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      boxId,
      userId,
      minLikes,
      search,
      startDate,
      endDate
    } = req.query

    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum

    // 构建查询条件
    const whereClause: any = {}

    if (status && status !== 'ALL') {
      whereClause.status = status
    }

    if (boxId) {
      whereClause.boxId = boxId
    }

    if (userId) {
      whereClause.userId = userId
    }

    if (minLikes) {
      whereClause.likeCount = {
        gte: Number(minLikes)
      }
    }

    if (search) {
      whereClause.content = {
        contains: search as string
      }
    }

    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) whereClause.createdAt.gte = new Date(startDate as string)
      if (endDate) whereClause.createdAt.lte = new Date(endDate as string)
    }

    const [replies, total] = await Promise.all([
      prisma.reply.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              anonymousName: true
            }
          },
          box: {
            select: {
              id: true,
              title: true,
              content: true
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
      prisma.reply.count({
        where: whereClause
      })
    ])

    res.json({
      success: true,
      data: {
        replies,
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

// 管理员删除回复
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params

    const reply = await prisma.reply.findUnique({
      where: { id }
    })

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: '回复不存在'
      })
    }

    // 软删除回复
    await prisma.reply.update({
      where: { id },
      data: { status: "DELETED" }
    })

    res.json({
      success: true,
      message: '回复已删除'
    })
  } catch (error) {
    next(error)
  }
})

export default router