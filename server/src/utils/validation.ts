import Joi from 'joi'

// 用户注册验证
export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': '用户名只能包含字母和数字',
    'string.min': '用户名至少需要3个字符',
    'string.max': '用户名不能超过30个字符',
    'any.required': '用户名是必填项'
  }),
  password: Joi.string().min(6).max(50).required().messages({
    'string.min': '密码至少需要6个字符',
    'string.max': '密码不能超过50个字符',
    'any.required': '密码是必填项'
  }),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
    'string.pattern.base': '请输入有效的手机号码'
  }),
  studentId: Joi.string().optional(),
  school: Joi.string().optional(),
  grade: Joi.string().optional(),
  isAnonymous: Joi.boolean().default(true),
  anonymousName: Joi.string().min(2).max(20).required().messages({
    'string.min': '匿名昵称至少需要2个字符',
    'string.max': '匿名昵称不能超过20个字符',
    'any.required': '匿名昵称是必填项'
  }),
  // 验证码字段已移除，注册不需要验证码
  role: Joi.string().valid('user', 'admin').default('user')
})

// 用户登录验证
export const loginSchema = Joi.object({
  phone: Joi.string().required().messages({
    'any.required': '用户名或手机号是必填项'
  }),
  password: Joi.string().required().messages({
    'any.required': '密码是必填项'
  }),
  role: Joi.string().valid('user', 'admin').default('user'),
  rememberMe: Joi.boolean().default(false)
})

// 创建情绪盲盒验证
export const createBoxSchema = Joi.object({
  title: Joi.string().max(100).optional(),
  content: Joi.string().min(10).max(2000).required().messages({
    'string.min': '内容至少需要10个字符',
    'string.max': '内容不能超过2000个字符',
    'any.required': '内容是必填项'
  }),
  isPublic: Joi.boolean().default(true),
  allowReply: Joi.boolean().default(true)
})

// 回复验证
export const replySchema = Joi.object({
  content: Joi.string().min(5).max(1000).required().messages({
    'string.min': '回复内容至少需要5个字符',
    'string.max': '回复内容不能超过1000个字符',
    'any.required': '回复内容是必填项'
  })
})

// 验证码发送验证
export const sendCodeSchema = Joi.object({
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.pattern.base': '请输入有效的手机号码',
    'any.required': '手机号是必填项'
  }),
  type: Joi.string().valid('REGISTER', 'LOGIN', 'RESET_PASSWORD').required().messages({
    'any.only': '验证码类型必须是REGISTER、LOGIN或RESET_PASSWORD之一',
    'any.required': '验证码类型是必填项'
  })
})

// 更新用户信息验证
export const updateProfileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).optional(),
  anonymousName: Joi.string().min(2).max(20).optional(),
  school: Joi.string().optional(),
  grade: Joi.string().optional(),
  isAnonymous: Joi.boolean().optional()
})

// 密码修改验证
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': '当前密码是必填项'
  }),
  newPassword: Joi.string().min(6).max(50).required().messages({
    'string.min': '新密码至少需要6个字符',
    'string.max': '新密码不能超过50个字符',
    'any.required': '新密码是必填项'
  })
})

// 管理员用户管理验证
export const adminUserSchema = Joi.object({
  isActive: Joi.boolean().required(),
  role: Joi.string().valid('USER', 'ADMIN').required()
})

// 重置密码验证
export const resetPasswordSchema = Joi.object({
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.pattern.base': '请输入有效的手机号码',
    'any.required': '手机号是必填项'
  }),
  newPassword: Joi.string().min(6).max(50).required().messages({
    'string.min': '新密码至少需要6个字符',
    'string.max': '新密码不能超过50个字符',
    'any.required': '新密码是必填项'
  }),
  verificationCode: Joi.string().length(6).required().messages({
    'string.length': '验证码必须是6位数字',
    'any.required': '验证码是必填项'
  })
})

// 敏感词验证
export const sensitiveWordSchema = Joi.object({
  word: Joi.string().required(),
  level: Joi.string().valid('WARNING', 'BLOCK').required()
})