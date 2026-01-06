// 用户相关类型
export interface User {
  id: string
  username: string
  phone?: string
  studentId?: string
  school?: string
  grade?: string
  avatar?: string
  isAnonymous: boolean
  anonymousName: string
  isActive: boolean
  role: 'user' | 'admin' | 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

// 盲盒相关类型
export interface EmotionBox {
  id: string
  userId: string
  title?: string
  content: string
  images?: string | string[]
  isPublic: boolean
  allowReply: boolean
  viewCount?: number
  isFeatured: boolean
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    username: string
    anonymousName: string
    isAnonymous: boolean
  }
  anonymousName?: string
  isAnonymous?: boolean
  replies?: Reply[]
  _count?: {
    views: number
    replies: number
  }
}

// 回复相关类型
export interface Reply {
  id: string
  boxId: string
  userId: string
  content: string
  likeCount?: number
  status: 'ACTIVE' | 'DELETED'
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    username: string
    anonymousName: string
    isAnonymous: boolean
  }
  box?: {
    id: string
    title?: string
    content: string
  }
  isLiked?: boolean
  _count?: {
    likes: number
  }
}

// 点赞相关类型
export interface Like {
  id: string
  replyId: string
  userId: string
  createdAt: string
}

// 盲盒查看记录类型
export interface BoxView {
  id: string
  boxId: string
  userId?: string
  viewedAt: string
}

// 系统设置类型
export interface SystemSetting {
  id: string
  settingKey: string
  settingValue: string
  description: string
}

// 敏感词类型
export interface SensitiveWord {
  id: string
  word: string
  level: 'WARNING' | 'BLOCK'
  createdAt: string
}

// 认证相关类型
export interface LoginCredentials {
  phone: string
  password: string
  verificationCode?: string
  rememberMe?: boolean
}

export interface RegisterData {
  username: string
  password: string
  phone?: string
  studentId?: string
  school?: string
  grade?: string
  isAnonymous: boolean
  anonymousName: string
  verificationCode?: string
}

export interface AuthResponse {
  user: User
  token?: string
  refreshToken?: string
  tokens?: {
    accessToken: string
    refreshToken: string
  }
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    items?: T[]
    boxes?: T[]
    replies?: T[]
    users?: T[]
    data?: T[]
  } & {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 统计数据类型
export interface UserStats {
  totalBoxes: number
  totalReplies: number
  totalLikes: number
  totalViews: number
}

export interface AdminStats {
  totalUsers: number
  newUsersToday: number
  totalBoxes: number
  newBoxesToday: number
  totalReplies: number
  newRepliesToday: number
  totalLikes: number
  newLikesToday: number
}

// 表单验证错误类型
export interface FormErrors {
  [key: string]: string | undefined
}

// 上传文件类型
export interface UploadFile {
  file: File
  url?: string
  id: string
  status: 'pending' | 'success' | 'error'
  error?: string
}