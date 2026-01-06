import api from './api'
import { request } from './api'
import { ApiResponse, UploadFile } from '@/types'

export const uploadService = {
  // 上传单个文件
  uploadSingleFile: async (file: File): Promise<ApiResponse<UploadFile>> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  },

  // 上传多个文件
  uploadMultipleFiles: async (files: File[]): Promise<ApiResponse<{ files: UploadFile[] }>> => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    
    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  },

  // 删除文件
  deleteFile: async (filename: string): Promise<ApiResponse> => {
    return request({
      method: 'DELETE',
      url: `/upload/${filename}`
    })
  }
}