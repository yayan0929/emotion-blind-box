import { request } from './api'
import { ApiResponse, EmotionBox, PaginatedResponse } from '@/types'

export const boxService = {
  // 获取盲盒列表
  getBoxes: async (params?: {
    page?: number
    limit?: number
    isFeatured?: boolean
    search?: string
  }): Promise<ApiResponse<PaginatedResponse<EmotionBox>>> => {
    return request({
      method: 'GET',
      url: '/boxes',
      params
    })
  },

  // 获取盲盒详情
  getBoxById: async (id: string): Promise<ApiResponse<{ box: EmotionBox }>> => {
    return request({
      method: 'GET',
      url: `/boxes/${id}`
    })
  },

  // 随机获取一个盲盒
  getRandomBox: async (): Promise<ApiResponse<{ box: EmotionBox }>> => {
    return request({
      method: 'GET',
      url: '/boxes/random/one'
    })
  },

  // 创建盲盒
  createBox: async (data: {
    title?: string
    content: string
    images?: string[]
    isPublic?: boolean
    allowReply?: boolean
  }): Promise<ApiResponse<{ box: EmotionBox }>> => {
    return request({
      method: 'POST',
      url: '/boxes',
      data
    })
  },

  // 更新盲盒
  updateBox: async (id: string, data: {
    title?: string
    content?: string
    images?: string[]
    isPublic?: boolean
    allowReply?: boolean
  }): Promise<ApiResponse<{ box: EmotionBox }>> => {
    return request({
      method: 'PUT',
      url: `/boxes/${id}`,
      data
    })
  },

  // 删除盲盒
  deleteBox: async (id: string): Promise<ApiResponse> => {
    return request({
      method: 'DELETE',
      url: `/boxes/${id}`
    })
  },

  // 获取用户的盲盒列表
  getUserBoxes: async (
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<PaginatedResponse<EmotionBox>>> => {
    return request({
      method: 'GET',
      url: `/users/${userId}/boxes`,
      params
    })
  }
}