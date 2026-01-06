import { request } from './api'
import { ApiResponse, AuthResponse, LoginCredentials, RegisterData } from '@/types'

export const authService = {
  // 用户注册
  register: async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    return request({
      method: 'POST',
      url: '/auth/register',
      data
    })
  },

  // 用户登录
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    return request({
      method: 'POST',
      url: '/auth/login',
      data: credentials
    })
  },

  // 刷新token
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> => {
    return request({
      method: 'POST',
      url: '/auth/refresh',
      data: { refreshToken }
    })
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<ApiResponse<{ user: any }>> => {
    return request({
      method: 'GET',
      url: '/auth/me'
    })
  },

  // 更新用户信息
  updateProfile: async (data: Partial<RegisterData>): Promise<ApiResponse<{ user: any }>> => {
    return request({
      method: 'PUT',
      url: '/auth/me',
      data
    })
  },

  // 修改密码
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
    return request({
      method: 'PUT',
      url: '/auth/password',
      data: { currentPassword, newPassword }
    })
  },

  // 重置密码
  resetPassword: async (phone: string, newPassword: string, verificationCode: string): Promise<ApiResponse> => {
    return request({
      method: 'POST',
      url: '/auth/reset-password',
      data: { phone, newPassword, verificationCode }
    })
  },

  // 发送验证码
  sendVerificationCode: async (phone: string, type: 'REGISTER' | 'LOGIN' | 'RESET_PASSWORD'): Promise<ApiResponse> => {
    return request({
      method: 'POST',
      url: '/auth/send-verification-code',
      data: { phone, type }
    })
  }
}