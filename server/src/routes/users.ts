import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth'
import { adminMiddleware } from '../middleware/auth'
import bcrypt from 'bcryptjs'

const router = express.Router()
const prisma = new PrismaClient()

// 获取用户发布的盲盒列表
router.get('/:id/boxes', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const currentUserId = (req as any).userId
    const { page = 1, limit = 10 } = req.query

    // 检查是否是用户本人或管理员
    const isOwner = currentUserId === id
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true }
    })

    if (!isOwner && currentUser?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: '无权访问该用户的盲盒'
      })
    }

    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum

    const whereClause = {
      userId: id,
      status: 'ACTIVE' as const
    }

    // 如果是查看自己的盲盒，显示所有状态（除了已删除）
    if (isOwner) {
      delete whereClause.status
    }

    const [boxes, total] = await Promise.all([
      prisma.emotionBox.findMany({
        where: whereClause,
        include: {
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

// 获取用户的回复列表
router.get('/:id/replies', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const currentUserId = (req as any).userId
    const { page = 1, limit = 10 } = req.query

    // 检查是否是用户本人或管理员
    const isOwner = currentUserId === id
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true }
    })

    if (!isOwner && currentUser?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: '无权访问该用户的回复'
      })
    }

    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum

    const whereClause = {
      userId: id,
      status: 'ACTIVE' as const
    }

    // 如果是查看自己的回复，显示所有状态（除了已删除）
    if (isOwner) {
      delete whereClause.status
    }

    const [replies, total] = await Promise.all([
      prisma.reply.findMany({
        where: whereClause,
        include: {
          box: {
            select: {
              id: true,
              title: true,
              content: true,
              user: {
                select: {
                  id: true,
                  anonymousName: true
                }
              }
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

// 获取用户点赞的回复列表
router.get('/:id/likes', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const currentUserId = (req as any).userId
    const { page = 1, limit = 10 } = req.query

    // 检查是否是用户本人或管理员
    const isOwner = currentUserId === id
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true }
    })

    if (!isOwner && currentUser?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: '无权访问该用户的点赞记录'
      })
    }

    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum

    const [likes, total] = await Promise.all([
      prisma.like.findMany({
        where: { userId: id },
        include: {
          reply: {
            include: {
              box: {
                select: {
                  id: true,
                  title: true,
                  content: true,
                  user: {
                    select: {
                      id: true,
                      anonymousName: true
                    }
                  }
                }
              },
              user: {
                select: {
                  id: true,
                  anonymousName: true
                }
              },
              _count: {
                select: {
                  likes: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.like.count({
        where: { userId: id }
      })
    ])

    // 提取回复数据
    const replies = likes.map(like => like.reply)

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

// 管理员获取用户列表
router.get('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      school,
      grade,
      isActive,
      search
    } = req.query

    const pageNum = Number(page)
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum

    // 构建查询条件
    const whereClause: any = {}

    if (school) whereClause.school = { contains: school as string }
    if (grade) whereClause.grade = { contains: grade as string }
    if (isActive !== undefined) whereClause.isActive = isActive === 'true'

    if (search) {
      whereClause.OR = [
        { username: { contains: search as string } },
        { anonymousName: { contains: search as string } },
        { phone: { contains: search as string } },
        { studentId: { contains: search as string } }
      ]
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
          anonymousName: true,
          isAnonymous: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              boxes: true,
              replies: true,
              likes: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.user.count({
        where: whereClause
      })
    ])

    // 脱敏处理手机号
    const sanitizedUsers = users.map(user => ({
      ...user,
      phone: user.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : null,
      studentId: user.studentId ? user.studentId.replace(/(.{2}).*(.{2})/, '$1****$2') : null
    }))

    res.json({
      success: true,
      data: {
        users: sanitizedUsers,
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

// 管理员获取单个用户详情
router.get('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        phone: true,
        studentId: true,
        school: true,
        grade: true,
        anonymousName: true,
        isAnonymous: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            boxes: true,
            replies: true,
            likes: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    // 脱敏处理
    const sanitizedUser = {
      ...user,
      phone: user.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : null,
      studentId: user.studentId ? user.studentId.replace(/(.{2}).*(.{2})/, '$1****$2') : null
    }

    res.json({
      success: true,
      data: { user: sanitizedUser }
    })
  } catch (error) {
    next(error)
  }
})

// 管理员冻结/解冻用户
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive 必须是布尔值'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    await prisma.user.update({
      where: { id },
      data: { isActive }
    })

    res.json({
      success: true,
      message: `用户已${isActive ? '解冻' : '冻结'}`
    })
  } catch (error) {
    next(error)
  }
})

// 管理员修改用户角色
router.put('/:id/role', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: '角色必须是 USER 或 ADMIN'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    await prisma.user.update({
      where: { id },
      data: { role: role as 'USER' | 'ADMIN' }
    })

    res.json({
      success: true,
      message: `用户角色已修改为${role === 'ADMIN' ? '管理员' : '普通用户'}`
    })
  } catch (error) {
    next(error)
  }
})

// 用户注销账号
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params
    const currentUserId = (req as any).userId
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true }
    })

    // 检查是否是用户本人或管理员
    const isOwner = currentUserId === id
    const isAdmin = currentUser?.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权删除该用户'
      })
    }

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
      message: '用户账号已注销'
    })
  } catch (error) {
    next(error)
  }
})

export default router