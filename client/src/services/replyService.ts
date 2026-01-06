import { request } from './api'
import { ApiResponse, Reply, PaginatedResponse } from '@/types'

export const replyService = {
  // 获取单个回复详情
  getReplyById: async (id: string): Promise<ApiResponse<{ reply: Reply }>> => {
    return request({
      method: 'GET',
      url: `/replies/${id}`
    })
  },

  // 创建回复
  createReply: async (data: {
    boxId: string
    content: string
  }): Promise<ApiResponse<{ reply: Reply }>> => {
    return request({
      method: 'POST',
      url: '/replies',
      data
    })
  },

  // 删除回复
  deleteReply: async (id: string): Promise<ApiResponse> => {
    return request({
      method: 'DELETE',
      url: `/replies/${id}`
    })
  },

  // 点赞/取消点赞回复
  toggleLikeReply: async (id: string): Promise<ApiResponse<{ liked: boolean }>> => {
    return request({
      method: 'POST',
      url: `/replies/${id}/like`
    })
  },

  // 获取回复点赞状态
  getReplyLikeStatus: async (id: string): Promise<ApiResponse<{ liked: boolean }>> => {
    return request({
      method: 'GET',
      url: `/replies/${id}/like-status`
    })
  },

  // 获取用户的回复列表
  getUserReplies: async (
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<PaginatedResponse<Reply>>> => {
    return request({
      method: 'GET',
      url: `/users/${userId}/replies`,
      params
    })
  },

  // 获取用户点赞的回复列表
  getUserLikedReplies: async (
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<PaginatedResponse<Reply>>> => {
    return request({
      method: 'GET',
      url: `/users/${userId}/likes`,
      params
    })
  },

  // 管理员获取所有回复列表
  getAllReplies: async (params?: {
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
      url: '/replies/admin/all',
      params
    })
  },

  // 管理员删除回复
  adminDeleteReply: async (id: string): Promise<ApiResponse> => {
    return request({
      method: 'DELETE',
      url: `/replies/admin/${id}`
    })
  }
}