import { request } from './api'
import { ApiResponse, PaginatedResponse, User, EmotionBox, Reply, SensitiveWord, SystemSetting } from '@/types'

export const adminService = {
  // 管理员登录
  adminLogin: async (username: string, password: string): Promise<ApiResponse<{ admin: any }>> => {
    return request({
      method: 'POST',
      url: '/admin/login',
      data: { username, password }
    })
  },

  // 获取系统统计数据
  getStats: async (period?: string): Promise<ApiResponse<any>> => {
    return request({
      method: 'GET',
      url: '/admin/stats',
      params: { period }
    })
  },

  // 获取热门盲盒
  getPopularBoxes: async (params?: { limit?: number; period?: string }): Promise<ApiResponse<{ boxes: EmotionBox[] }>> => {
    return request({
      method: 'GET',
      url: '/admin/popular-boxes',
      params
    })
  },

  // 获取活跃用户
  getActiveUsers: async (params?: { limit?: number; period?: string }): Promise<ApiResponse<any>> => {
    return request({
      method: 'GET',
      url: '/admin/active-users',
      params
    })
  },

  // 获取所有用户
  getAllUsers: async (params?: {
    page?: number
    limit?: number
    school?: string
    grade?: string
    isActive?: boolean
    search?: string
  }): Promise<ApiResponse<PaginatedResponse<User>>> => {
    return request({
      method: 'GET',
      url: '/admin/users',
      params
    })
  },

  // 获取单个用户详情
  getUserById: async (id: string): Promise<ApiResponse<{ user: User }>> => {
    return request({
      method: 'GET',
      url: `/admin/users/${id}`
    })
  },

  // 更新用户状态
  updateUserStatus: async (id: string, isActive: boolean): Promise<ApiResponse> => {
    return request({
      method: 'PUT',
      url: `/admin/users/${id}/status`,
      data: { isActive }
    })
  },

  // 删除用户
  deleteUser: async (id: string): Promise<ApiResponse> => {
    return request({
      method: 'DELETE',
      url: `/admin/users/${id}`
    })
  },

  // 获取管理员盲盒列表
  getAdminBoxes: async (params?: {
    page?: number
    limit?: number
    status?: string
    userId?: string
    isFeatured?: boolean
    search?: string
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<PaginatedResponse<EmotionBox>>> => {
    return request({
      method: 'GET',
      url: '/admin/boxes',
      params
    })
  },

  // 设置盲盒精选状态
  setFeaturedBox: async (id: string, isFeatured: boolean): Promise<ApiResponse> => {
    return request({
      method: 'PUT',
      url: `/admin/boxes/${id}/featured`,
      data: { isFeatured }
    })
  },

  // 下架盲盒
  archiveBox: async (id: string): Promise<ApiResponse> => {
    return request({
      method: 'PUT',
      url: `/admin/boxes/${id}/archive`
    })
  },

  // 删除盲盒
  deleteBox: async (id: string): Promise<ApiResponse> => {
    return request({
      method: 'DELETE',
      url: `/admin/boxes/${id}`
    })
  },

  // 获取管理员回复列表
  getAdminReplies: async (params?: {
    page?: number
    limit?: number
    status?: string
    boxId?: string
    userId?: string
    minLikes?: number
    search?: string
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<PaginatedResponse<Reply>>> => {
    return request({
      method: 'GET',
      url: '/admin/replies',
      params
    })
  },

  // 删除回复
  deleteReply: async (id: string): Promise<ApiResponse> => {
    return request({
      method: 'DELETE',
      url: `/admin/replies/${id}`
    })
  },

  // 获取敏感词列表
  getSensitiveWords: async (params?: {
    page?: number
    limit?: number
    level?: string
  }): Promise<ApiResponse<SensitiveWord[]>> => {
    return request({
      method: 'GET',
      url: '/admin/sensitive-words',
      params
    })
  },

  // 创建敏感词
  createSensitiveWord: async (data: { word: string, level: 'WARNING' | 'BLOCK' }): Promise<ApiResponse<SensitiveWord>> => {
    return request({
      method: 'POST',
      url: '/admin/sensitive-words',
      data
    })
  },

  // 更新敏感词
  updateSensitiveWord: async (id: string, data: { word: string, level: 'WARNING' | 'BLOCK' }): Promise<ApiResponse<SensitiveWord>> => {
    return request({
      method: 'PUT',
      url: `/admin/sensitive-words/${id}`,
      data
    })
  },

  // 删除敏感词
  deleteSensitiveWord: async (id: string): Promise<ApiResponse> => {
    return request({
      method: 'DELETE',
      url: `/admin/sensitive-words/${id}`
    })
  },

  // 获取系统设置
  getSystemSettings: async (): Promise<ApiResponse<SystemSetting[]>> => {
    return request({
      method: 'GET',
      url: '/admin/settings'
    })
  },

  // 更新系统设置
  updateSystemSettings: async (settings: SystemSetting[]): Promise<ApiResponse> => {
    const settingMap = settings.reduce((acc, setting) => {
      acc[setting.settingKey] = setting.settingValue;
      return acc;
    }, {} as Record<string, any>);
    
    return request({
      method: 'PUT',
      url: '/admin/settings',
      data: settingMap
    })
  },

  // 获取单个设置
  getSetting: async (key: string): Promise<ApiResponse<{ [key: string]: any }>> => {
    return request({
      method: 'GET',
      url: `/admin/settings/${key}`
    })
  },

  // 更新单个设置
  updateSetting: async (key: string, value: any): Promise<ApiResponse> => {
    return request({
      method: 'PUT',
      url: `/admin/settings/${key}`,
      data: { value }
    })
  },

  // 重置系统设置
  resetSettings: async (): Promise<ApiResponse> => {
    return request({
      method: 'POST',
      url: '/admin/settings/reset'
    })
  },

  // 备份数据
  backupData: async (): Promise<ApiResponse<any>> => {
    return request({
      method: 'POST',
      url: '/admin/settings/backup'
    })
  }
}