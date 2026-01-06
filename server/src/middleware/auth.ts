import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { createError } from './errorHandler'

const prisma = new PrismaClient()

// 扩展Request类型，添加用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        username: string
        role: string
      }
    }
  }
}

// 用户认证中间件
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供访问令牌'
      })
    }
    
    const token = authHeader.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '无效的访问令牌'
      })
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // 从数据库获取用户信息，确保用户仍然存在且处于激活状态
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId || decoded.id },
      select: { id: true, username: true, role: true, isActive: true }
    })
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      })
    }
    
    // 将用户信息添加到请求对象
    ;(req as any).userId = user.id
    ;(req as any).user = {
      id: user.id,
      username: user.username,
      role: user.role
    }
    
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: '无效的访问令牌'
      })
    }
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
}

// 管理员认证中间件
export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user
    
    if (!user || user.role !== 'ADMIN' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      })
    }
    
    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError('未提供访问令牌', 401))
    }
    
    const token = authHeader.split(' ')[1]
    
    if (!token) {
      return next(createError('无效的访问令牌', 401))
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    // 从数据库获取用户信息，确保用户仍然存在且处于激活状态
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, role: true, isActive: true }
    })
    
    if (!user || !user.isActive) {
      return next(createError('用户不存在或已被禁用', 401))
    }
    
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role
    }
    
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createError('无效的访问令牌', 401))
    }
    return next(error)
  }
}

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('未授权', 401))
    }
    
    if (!roles.includes(req.user.role)) {
      return next(createError('权限不足', 403))
    }
    
    next()
  }
}