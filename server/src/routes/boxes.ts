import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth'
import { adminMiddleware } from '../middleware/auth'
import { checkSensitiveContent } from '../utils/helpers'

const router = express.Router()
const prisma = new PrismaClient()

// 获取盲盒详情
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = (req as any).userId

    const box = await prisma.emotionBox.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            anonymousName: true,
            isAnonymous: true
          }
        },
        replies: {
          where: { status: 'ACTIVE' },
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
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            views: true,
            replies: true
          }
        }
      }
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

    // 记录查看记录
    if (userId) {
      // 检查是否已经查看过
      const existingView = await prisma.boxView.findFirst({
        where: {
          boxId: id,
          userId
        }
      })

      if (!existingView) {
        // 创建查看记录
        await prisma.boxView.create({
          data: {
            boxId: id,
            userId
          }
        })

        // 更新查看次数
        await prisma.emotionBox.update({
          where: { id },
          data: {
            viewCount: {
              increment: 1
            }
          }
        })
      }
    }

    res.json({
      success: true,
      data: { box }
    })
  } catch (error) {
    next(error)
  }
})

// 获取盲盒列表
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      isFeatured,
      search
    } = req.query

    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum

    // 构建查询条件
    const whereClause: any = {
      status: "ACTIVE",
      isPublic: true
    }

    if (isFeatured !== undefined) {
      whereClause.isFeatured = isFeatured === 'true'
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search as string } },
        { content: { contains: search as string } }
      ]
    }

    const [boxes, total] = await Promise.all([
      prisma.emotionBox.findMany({
        where: whereClause,
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
              views: true,
              replies: true
            }
          }
        },
        orderBy: {
          ...(isFeatured === 'true' 
            ? { isFeatured: 'desc' } 
            : { createdAt: 'desc' }
          )
        },
        skip,
        take: limitNum
      }),
      prisma.emotionBox.count({
        where: whereClause
      })
    ])

    res.json({
      success: true,
      data: {
        boxes,
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

// 随机获取一个盲盒
router.get('/random/one', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '需要登录才能抽取盲盒'
      })
    }

    // 获取用户已查看的盲盒ID列表
    const viewedBoxes = await prisma.boxView.findMany({
      where: { userId },
      select: { boxId: true }
    })

    const viewedBoxIds = viewedBoxes.map(view => view.boxId)

    // 获取用户自己的盲盒ID列表
    const userBoxes = await prisma.emotionBox.findMany({
      where: { userId },
      select: { id: true }
    })

    const userBoxIds = userBoxes.map(box => box.id)

    // 查找符合条件的盲盒
    const availableBoxes = await prisma.emotionBox.findMany({
      where: {
        id: {
          notIn: [...viewedBoxIds, ...userBoxIds]
        },
        status: "ACTIVE",
        isPublic: true
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
            views: true,
            replies: true
          }
        }
      }
    })

    if (availableBoxes.length === 0) {
      return res.status(404).json({
        success: false,
        message: '暂无可抽取的盲盒'
      })
    }

    // 随机选择一个盲盒
    const randomIndex = Math.floor(Math.random() * availableBoxes.length)
    const randomBox = availableBoxes[randomIndex]

    // 记录查看记录
    await prisma.boxView.create({
      data: {
        boxId: randomBox.id,
        userId
      }
    })

    // 更新查看次数
    await prisma.emotionBox.update({
      where: { id: randomBox.id },
      data: {
        viewCount: {
          increment: 1
        }
      }
    })

    res.json({
      success: true,
      data: { box: randomBox }
    })
  } catch (error) {
    next(error)
  }
})

// 创建盲盒
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).userId
    const { title, content, images, isPublic = true, allowReply = true } = req.body

    if (!content) {
      return res.status(400).json({
        success: false,
        message: '内容不能为空'
      })
    }

    // 检查敏感词
    const contentToCheck = `${title || ''} ${content}`
    const sensitiveCheck = await checkSensitiveContent(contentToCheck)
    
    if (sensitiveCheck.isBlocked) {
      return res.status(400).json({
        success: false,
        message: '内容包含敏感信息，请修改后重试'
      })
    }

    // 解析图片数组
    let parsedImages = []
    if (images) {
      try {
        parsedImages = typeof images === 'string' ? JSON.parse(images) : images
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: '图片格式错误'
        })
      }
    }

    const newBox = await prisma.emotionBox.create({
      data: {
        userId,
        title,
        content,
        images: JSON.stringify(parsedImages),
        isPublic,
        allowReply
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
            views: true,
            replies: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      message: '盲盒创建成功',
      data: { box: newBox }
    })
  } catch (error) {
    next(error)
  }
})

// 更新盲盒
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = (req as any).userId
    const { title, content, images, isPublic, allowReply } = req.body

    // 查找盲盒
    const box = await prisma.emotionBox.findUnique({
      where: { id }
    })

    if (!box) {
      return res.status(404).json({
        success: false,
        message: '盲盒不存在'
      })
    }

    // 检查权限
    if (box.userId !== userId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      })

      if (currentUser?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: '无权修改该盲盒'
        })
      }
    }

    // 如果盲盒已被查看，不允许修改
    if (box.viewCount > 0 && box.userId === userId) {
      return res.status(400).json({
        success: false,
        message: '盲盒已被查看，无法修改'
      })
    }

    // 检查敏感词
    const contentToCheck = `${title || ''} ${content || box.content}`
    const sensitiveCheck = await checkSensitiveContent(contentToCheck)
    
    if (sensitiveCheck.isBlocked) {
      return res.status(400).json({
        success: false,
        message: '内容包含敏感信息，请修改后重试'
      })
    }

    // 解析图片数组
    let parsedImages = box.images
    if (images !== undefined) {
      try {
        parsedImages = typeof images === 'string' ? JSON.parse(images) : images
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: '图片格式错误'
        })
      }
    }

    // 更新盲盒
    const updatedBox = await prisma.emotionBox.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        images: JSON.stringify(parsedImages),
        ...(isPublic !== undefined && { isPublic }),
        ...(allowReply !== undefined && { allowReply })
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
            views: true,
            replies: true
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

// 删除盲盒
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = (req as any).userId

    // 查找盲盒
    const box = await prisma.emotionBox.findUnique({
      where: { id }
    })

    if (!box) {
      return res.status(404).json({
        success: false,
        message: '盲盒不存在'
      })
    }

    // 检查权限
    if (box.userId !== userId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      })

      if (currentUser?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: '无权删除该盲盒'
        })
      }
    }

    // 软删除盲盒
    await prisma.emotionBox.update({
      where: { id },
      data: { status: "DELETED" }
    })

    res.json({
      success: true,
      message: '盲盒已删除'
    })
  } catch (error) {
    next(error)
  }
})

// 管理员获取盲盒列表
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      isFeatured,
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

    if (userId) {
      whereClause.userId = userId
    }

    if (isFeatured !== undefined) {
      whereClause.isFeatured = isFeatured === 'true'
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search as string } },
        { content: { contains: search as string } }
      ]
    }

    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) whereClause.createdAt.gte = new Date(startDate as string)
      if (endDate) whereClause.createdAt.lte = new Date(endDate as string)
    }

    const [boxes, total] = await Promise.all([
      prisma.emotionBox.findMany({
        where: whereClause,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.emotionBox.count({
        where: whereClause
      })
    ])

    res.json({
      success: true,
      data: {
        boxes,
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

// 管理员设置精选盲盒
router.put('/:id/featured', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const { isFeatured } = req.body

    if (typeof isFeatured !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isFeatured 必须是布尔值'
      })
    }

    const box = await prisma.emotionBox.findUnique({
      where: { id }
    })

    if (!box) {
      return res.status(404).json({
        success: false,
        message: '盲盒不存在'
      })
    }

    await prisma.emotionBox.update({
      where: { id },
      data: { isFeatured }
    })

    res.json({
      success: true,
      message: `盲盒已${isFeatured ? '设为精选' : '取消精选'}`
    })
  } catch (error) {
    next(error)
  }
})

// 管理员下架盲盒
router.put('/:id/archive', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params

    const box = await prisma.emotionBox.findUnique({
      where: { id }
    })

    if (!box) {
      return res.status(404).json({
        success: false,
        message: '盲盒不存在'
      })
    }

    await prisma.emotionBox.update({
      where: { id },
      data: { status: "ARCHIVED" }
    })

    res.json({
      success: true,
      message: '盲盒已下架'
    })
  } catch (error) {
    next(error)
  }
})

export default router