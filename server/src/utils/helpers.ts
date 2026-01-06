import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 密码加密
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// 密码验证
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

// 生成JWT令牌
export const generateToken = (payload: any): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

// 生成刷新令牌
export const generateRefreshToken = (payload: any): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  })
}

// 验证JWT令牌
export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET!)
}

// 生成随机验证码
export const generateVerificationCode = (length: number = 6): string => {
  const digits = '0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)]
  }
  return code
}

// 生成匿名昵称
export const generateAnonymousName = (): string => {
  const adjectives = [
    '快乐的', '温暖的', '友善的', '勇敢的', '聪明的', '善良的', '开朗的', '害羞的',
    '好奇的', '冷静的', '活泼的', '温柔的', '坚强的', '幽默的', '自信的', '细心的'
  ]
  
  const nouns = [
    '小熊', '小兔', '小猫', '小鸟', '小鱼', '小羊', '小鹿', '小狐狸',
    '小象', '小松鼠', '小熊猫', '小企鹅', '小海豚', '小蜜蜂', '小蝴蝶', '小星星'
  ]
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
  const randomNumber = Math.floor(Math.random() * 999) + 1
  
  return `${randomAdjective}${randomNoun}${randomNumber}`
}

// 分页工具
export const getPaginationParams = (
  page?: number | string,
  limit?: number | string
) => {
  const pageNumber = page ? parseInt(page.toString()) : 1
  const limitNumber = limit ? parseInt(limit.toString()) : 10
  
  const skip = (pageNumber - 1) * limitNumber
  
  return {
    skip,
    take: limitNumber,
    page: pageNumber
  }
}

// 格式化分页响应
export const formatPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit)
  
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}

// 安全地解析JSON字符串
export const safeJsonParse = (jsonString: string, defaultValue: any = []) => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    return defaultValue
  }
}

// 安全地字符串化JSON
export const safeJsonStringify = (obj: any) => {
  try {
    return JSON.stringify(obj)
  } catch (error) {
    return '[]'
  }
}

// 生成随机UUID
export const generateId = (): string => {
  return uuidv4()
}

// 时间格式化
export const formatTime = (date: Date): string => {
  return date.toISOString()
}

// 检查敏感词内容
export const checkSensitiveContent = async (content: string): Promise<{ isBlocked: boolean; warnings: string[] }> => {
  try {
    // 获取所有敏感词
    const sensitiveWords = await prisma.sensitiveWord.findMany()
    
    const warnings: string[] = []
    let isBlocked = false
    
    // 检查内容是否包含敏感词
    for (const word of sensitiveWords) {
      const regex = new RegExp(word.word, 'gi')
      if (content.match(regex)) {
        if (word.level === 'BLOCK') {
          isBlocked = true
          warnings.push(`内容包含敏感词: ${word.word}`)
        } else if (word.level === 'WARNING') {
          warnings.push(`内容可能包含不当词汇: ${word.word}`)
        }
      }
    }
    
    return { isBlocked, warnings }
  } catch (error) {
    console.error('敏感词检测失败:', error)
    // 默认不阻止
    return { isBlocked: false, warnings: [] }
  }
}

// 发送验证码 (模拟实现)
export const sendVerificationCode = async (phone: string, code: string): Promise<boolean> => {
  try {
    // 在实际应用中，这里应该调用短信服务API发送验证码
    // 例如阿里云短信、腾讯云短信等
    console.log(`向 ${phone} 发送验证码: ${code}`)
    
    // 这里是一个模拟实现，直接返回true
    // 实际应用中需要根据短信服务商的API实现
    return true
  } catch (error) {
    console.error('发送验证码失败:', error)
    return false
  }
}

// 数据脱敏
export const maskSensitiveData = (data: string, type: 'phone' | 'studentId'): string => {
  if (!data) return data
  
  if (type === 'phone') {
    // 手机号脱敏: 138****1234
    return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  } else if (type === 'studentId') {
    // 学号脱敏: 前后保留2位，中间用*代替
    if (data.length <= 4) return data
    return data.substring(0, 2) + '*'.repeat(data.length - 4) + data.substring(data.length - 2)
  }
  
  return data
}

// 生成日期范围的查询条件
export const getDateRangeFilter = (startDate?: string, endDate?: string) => {
  const filter: any = {}
  
  if (startDate) {
    filter.gte = new Date(startDate)
  }
  
  if (endDate) {
    filter.lte = new Date(endDate)
  }
  
  return Object.keys(filter).length > 0 ? filter : undefined
}

// 检查用户今日盲盒发布数量
export const checkDailyBoxLimit = async (userId: string): Promise<{ allowed: boolean; count: number; limit: number }> => {
  try {
    // 获取每日限制设置
    const dailyLimitSetting = await prisma.systemSetting.findUnique({
      where: { settingKey: 'dailyBoxLimit' }
    })
    
    const limit = dailyLimitSetting ? parseInt(dailyLimitSetting.settingValue) : 3
    
    // 获取今日开始时间
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 计算用户今日已发布的盲盒数量
    const count = await prisma.emotionBox.count({
      where: {
        userId,
        createdAt: { gte: today }
      }
    })
    
    return {
      allowed: count < limit,
      count,
      limit
    }
  } catch (error) {
    console.error('检查每日盲盒限制失败:', error)
    // 默认允许
    return {
      allowed: true,
      count: 0,
      limit: 3
    }
  }
}

// 自动精选处理
export const autoFeaturedBox = async (boxId: string): Promise<boolean> => {
  try {
    // 获取自动精选阈值设置
    const thresholdSetting = await prisma.systemSetting.findUnique({
      where: { settingKey: 'autoFeaturedThreshold' }
    })
    
    const threshold = thresholdSetting ? parseInt(thresholdSetting.settingValue) : 5
    
    // 计算盲盒的总点赞数
    const box = await prisma.emotionBox.findUnique({
      where: { id: boxId },
      include: {
        replies: {
          include: {
            _count: {
              select: {
                likes: true
              }
            }
          }
        }
      }
    })
    
    if (!box) return false
    
    const totalLikes = box.replies.reduce((sum, reply) => sum + reply._count.likes, 0)
    
    // 如果点赞数达到阈值，自动设为精选
    if (totalLikes >= threshold && !box.isFeatured) {
      await prisma.emotionBox.update({
        where: { id: boxId },
        data: { isFeatured: true }
      })
      return true
    }
    
    return false
  } catch (error) {
    console.error('自动精选处理失败:', error)
    return false
  }
}