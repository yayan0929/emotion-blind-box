import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { authMiddleware } from '../middleware/auth'
import { sendVerificationCode } from '../utils/helpers'
import { sendVerificationEmail, sendWelcomeEmail } from '../utils/email'
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema
} from '../utils/validation'

const router = express.Router()
const prisma = new PrismaClient()

// 临时验证码存储（开发环境使用）
const tempVerificationCodes = new Map()

// 用户注册
router.post('/register', async (req, res, next) => {
  try {
    // 验证请求数据
    const { error, value } = registerSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      })
    }

    const { username, phone, studentId, school, grade, password, isAnonymous, anonymousName } = value

    // 不需要验证码，直接允许注册
    console.log(`【注册】用户: ${username}, 手机: ${phone}, 角色: ${value.role || 'user'}`)

    // 检查手机号是否已注册
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          ...(studentId ? [{ studentId }] : [])
        ]
      }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.phone === phone ? '手机号已注册' : '学号已被使用'
      })
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 12)

    // 确定用户角色
    const userRole = value.role === 'admin' ? 'ADMIN' : 'USER';
    
    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        username,
        phone,
        studentId,
        school,
        grade,
        password: hashedPassword,
        role: userRole,
        isAnonymous,
        anonymousName
      },
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
        createdAt: true
      }
    })

    // 验证码已跳过，无需标记

    // 生成JWT令牌
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key'
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key'
    
    const accessToken = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    )

    const refreshToken = jwt.sign(
      { userId: newUser.id },
      jwtRefreshSecret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' } as any
    )

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: newUser,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    })
    
    // 发送欢迎邮件（如果手机号是邮箱格式）
    if (process.env.NODE_ENV === 'production' && phone.includes('@')) {
      try {
        await sendWelcomeEmail(phone, username)
      } catch (error) {
        console.error('发送欢迎邮件失败:', error)
        // 不影响注册流程，只是记录错误
      }
    }
  } catch (error) {
    next(error)
  }
})

// 用户登录
router.post('/login', async (req, res, next) => {
  try {
    // 验证请求数据
    const { error, value } = loginSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      })
    }

    const { phone, password } = value

    // 查找用户 - 支持手机号或用户名登录
    let user = null
    if (/^1[3-9]\d{9}$/.test(phone)) {
      // 手机号登录
      user = await prisma.user.findUnique({
        where: { phone }
      })
    } else {
      // 用户名登录
      user = await prisma.user.findFirst({
        where: { username: phone }
      })
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      })
    }

    // 检查用户是否被冻结
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: '账号已被冻结，请联系管理员'
      })
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      })
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      })
    }

    // 生成JWT令牌
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key'
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key'
    
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    )

    const refreshToken = jwt.sign(
      { userId: user.id },
      jwtRefreshSecret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' } as any
    )

    // 返回用户信息（不包括密码）
    const { password: _, ...userInfo } = user

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: userInfo,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    })
  } catch (error) {
    next(error)
  }
})

// 刷新令牌
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: '缺少刷新令牌'
      })
    }

    // 验证刷新令牌
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被冻结'
      })
    }

    // 生成新的访问令牌
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key'
    
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    )

    res.json({
      success: true,
      message: '令牌刷新成功',
      data: {
        accessToken
      }
    })
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '刷新令牌无效'
    })
  }
})

// 获取当前用户信息
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        updatedAt: true
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    res.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    next(error)
  }
})

// 更新用户信息
router.put('/me', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).userId
    const { username, school, grade, anonymousName, isAnonymous } = req.body

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(school !== undefined && { school }),
        ...(grade !== undefined && { grade }),
        ...(anonymousName && { anonymousName }),
        ...(isAnonymous !== undefined && { isAnonymous })
      },
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
        createdAt: true,
        updatedAt: true
      }
    })

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: { user: updatedUser }
    })
  } catch (error) {
    next(error)
  }
})

// 修改密码
router.put('/password', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).userId
    const { currentPassword, newPassword } = req.body

    // 验证输入
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '请提供当前密码和新密码'
      })
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    // 验证当前密码
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '当前密码不正确'
      })
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    res.json({
      success: true,
      message: '密码修改成功'
    })
  } catch (error) {
    next(error)
  }
})

// 重置密码
router.post('/reset-password', async (req, res, next) => {
  try {
    // 验证请求数据
    const { error, value } = resetPasswordSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      })
    }

    const { phone, newPassword, verificationCode } = value

    // 验证验证码
    const key = `${phone}_RESET_PASSWORD`
    const codeRecord = tempVerificationCodes.get(key)

    if (!codeRecord || 
        codeRecord.code !== verificationCode || 
        codeRecord.used || 
        Date.now() > codeRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        message: '验证码无效或已过期'
      })
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { phone }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // 更新密码
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    // 验证码已跳过，无需标记

    res.json({
      success: true,
      message: '密码重置成功'
    })
  } catch (error) {
    next(error)
  }
})

// 发送验证码
router.post('/send-verification-code', async (req, res, next) => {
  try {
    const { phone, type } = req.body

    if (!phone || !type) {
      return res.status(400).json({
        success: false,
        message: '请提供手机号和验证码类型'
      })
    }

    if (!['REGISTER', 'LOGIN', 'RESET_PASSWORD'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: '验证码类型无效'
      })
    }

    // 检查是否频繁发送（使用内存存储）
    const key = `${phone}_${type}`
    const lastCode = tempVerificationCodes.get(key)
    
    if (lastCode && (Date.now() - lastCode.timestamp) < 60 * 1000) {
      return res.status(429).json({
        success: false,
        message: '验证码发送过于频繁，请稍后再试'
      })
    }

    // 生成6位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log(`【验证码】手机号: ${phone}, 类型: ${type}, 验证码: ${code}`)

    // 保存到内存（5分钟过期）
    tempVerificationCodes.set(key, {
      code,
      timestamp: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000,
      used: false
    })

    // 定期清理过期的验证码
    setTimeout(() => {
      const storedCode = tempVerificationCodes.get(key)
      if (storedCode && Date.now() > storedCode.expiresAt) {
        tempVerificationCodes.delete(key)
      }
    }, 5 * 60 * 1000)

    // 在开发环境中返回验证码
    res.json({
      success: true,
      message: '验证码发送成功',
      code
    })
  } catch (error) {
    next(error)
  }
})

export default router