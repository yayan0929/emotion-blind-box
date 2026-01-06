import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, adminMiddleware } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// 获取系统设置
router.get('/', async (req, res, next) => {
  try {
    // 获取所有系统设置
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
router.put('/', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const settings = req.body
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: '设置格式错误'
      })
    }
    
    // 批量更新设置
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      // 跳过不存在的设置项
      const validKeys = [
        'siteName', 'siteDescription', 'allowRegistration', 'allowRegister', 'requireStudentId',
        'maxImageCount', 'maxImagesPerBox', 'maxImageSize', 'allowAnonymousView', 'allowBoxDelete',
        'userAgreement', 'violationRules', 'autoFeaturedThreshold', 'dailyBoxLimit',
        'maintenanceMode', 'maintenanceMessage'
      ]
      
      if (!validKeys.includes(key)) return null
      
      return prisma.systemSetting.upsert({
        where: { settingKey: key },
        update: {
          settingValue: String(value)
        },
        create: {
          settingKey: key,
          settingValue: String(value),
          description: getSettingDescription(key)
        }
      })
    })
    
    await Promise.all(updatePromises.filter(Boolean))
    
    res.json({
      success: true,
      message: '系统设置更新成功'
    })
  } catch (error) {
    next(error)
  }
})

// 获取单个设置值
router.get('/:key', async (req, res, next) => {
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
    
    // 尝试转换为合适的类型
    let value: any = setting.settingValue
    if (value === 'true') value = true
    else if (value === 'false') value = false
    else if (/^\d+$/.test(value)) value = parseInt(value)
    
    res.json({
      success: true,
      data: { [key]: value }
    })
  } catch (error) {
    next(error)
  }
})

// 更新单个设置值
router.put('/:key', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { key } = req.params
    const { value } = req.body
    
    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: '值不能为空'
      })
    }
    
    // 检查是否是有效的设置键
    const validKeys = [
      'siteName', 'siteDescription', 'allowRegister', 'requireStudentId',
      'maxImagesPerBox', 'maxImageSize', 'allowAnonymousView', 'allowBoxDelete',
      'violationRules', 'autoFeaturedThreshold', 'dailyBoxLimit',
      'maintenanceMode', 'maintenanceMessage'
    ]
    
    if (!validKeys.includes(key)) {
      return res.status(400).json({
        success: false,
        message: '无效的设置键'
      })
    }
    
    await prisma.systemSetting.upsert({
      where: { settingKey: key },
      update: {
        settingValue: String(value)
      },
      create: {
        settingKey: key,
        settingValue: String(value),
        description: getSettingDescription(key)
      }
    })
    
    res.json({
      success: true,
      message: '设置更新成功'
    })
  } catch (error) {
    next(error)
  }
})

// 重置系统设置
router.post('/reset', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    // 清除所有设置
    await prisma.systemSetting.deleteMany({})
    
    // 初始化默认设置
    const defaultSettings = [
      { settingKey: 'siteName', settingValue: '大学生情绪盲盒交换站', description: '网站名称' },
      { settingKey: 'siteDescription', settingValue: '一个面向大学生群体的匿名情绪互助平台', description: '网站描述' },
      { settingKey: 'allowRegister', settingValue: 'true', description: '是否允许注册' },
      { settingKey: 'requireStudentId', settingValue: 'false', description: '是否必须填写学号' },
      { settingKey: 'maxImagesPerBox', settingValue: '3', description: '每个盲盒最大图片数量' },
      { settingKey: 'maxImageSize', settingValue: '5242880', description: '单张图片最大大小(字节)' },
      { settingKey: 'allowAnonymousView', settingValue: 'true', description: '是否允许匿名查看' },
      { settingKey: 'allowBoxDelete', settingValue: 'true', description: '是否允许删除盲盒' },
      { settingKey: 'violationRules', settingValue: '请遵守平台规则，禁止发布违法违规、色情低俗、人身攻击等内容', description: '违规规则' },
      { settingKey: 'autoFeaturedThreshold', settingValue: '5', description: '自动精选阈值(点赞数)' },
      { settingKey: 'dailyBoxLimit', settingValue: '3', description: '每日发布盲盒限制' },
      { settingKey: 'maintenanceMode', settingValue: 'false', description: '维护模式' },
      { settingKey: 'maintenanceMessage', settingValue: '系统维护中，请稍后再试', description: '维护模式提示信息' }
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
router.post('/backup', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    // 这里只是模拟备份过程，实际应用中需要实现具体的备份逻辑
    // 例如导出数据库为SQL文件或JSON文件
    
    const tables = ['users', 'emotion_boxes', 'replies', 'likes', 'box_views', 'verification_codes', 'system_settings', 'sensitive_words']
    const backupData: Record<string, any> = {}
    
    for (const table of tables) {
      const model = getModelName(table)
      if (model) {
        // @ts-ignore
        backupData[table] = await prisma[model].findMany()
      }
    }
    
    // 在实际应用中，这里应该将备份数据保存到文件或云存储
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup_${timestamp}.json`
    
    res.json({
      success: true,
      message: '数据备份成功',
      data: {
        filename,
        timestamp: new Date().toISOString(),
        size: JSON.stringify(backupData).length
      }
    })
  } catch (error) {
    next(error)
  }
})

// 获取设置描述
function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    siteName: '网站名称',
    siteDescription: '网站描述',
    allowRegistration: '是否允许注册',
    allowRegister: '是否允许注册',
    requireStudentId: '是否必须填写学号',
    maxImageCount: '单个盲盒最大图片数量',
    maxImagesPerBox: '单个盲盒最大图片数量',
    maxImageSize: '单张图片最大大小(字节)',
    allowAnonymousView: '是否允许匿名查看',
    allowBoxDelete: '是否允许删除盲盒',
    userAgreement: '用户协议',
    violationRules: '违规规则',
    autoFeaturedThreshold: '自动精选盲盒的点赞数阈值',
    dailyBoxLimit: '每日盲盒发布限制',
    maintenanceMode: '维护模式',
    maintenanceMessage: '维护模式提示信息'
  }
  
  return descriptions[key] || '系统设置'
}

// 获取Prisma模型名称
function getModelName(table: string): string | null {
  const modelMap: Record<string, string> = {
    users: 'user',
    emotion_boxes: 'emotionBox',
    replies: 'reply',
    likes: 'like',
    box_views: 'boxView',
    verification_codes: 'verificationCode',
    system_settings: 'systemSetting',
    sensitive_words: 'sensitiveWord'
  }
  
  return modelMap[table] || null
}

export default router