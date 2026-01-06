import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse } from '@/types'

// 动态获取API基础URL，支持本地网络访问
const getBaseURL = () => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocalhost) {
    return '/api'; // 本地开发使用代理
  }
  
  // 生产环境使用部署的后端服务URL
  return 'https://emotion-box-api.onrender.com/api'; // 部署后需要替换为实际的后端URL
};

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      
      // 处理特定错误状态码
      if (status === 401) {
        // 未授权，清除本地token
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        
        // 触发全局登出事件，而不是直接跳转
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'))
        }
      }
      
      // 返回服务器提供的错误信息
      return Promise.reject({
        message: data.message || '服务器错误',
        code: status,
        ...data,
      })
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      return Promise.reject({
        message: '网络错误，请检查您的网络连接',
        code: 0,
      })
    } else {
      // 发送请求时出错
      return Promise.reject({
        message: error.message || '请求失败',
        code: -1,
      })
    }
  }
)

// 通用请求方法
export const request = async <T>(
  config: InternalAxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await api(config)
    return response.data
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '请求失败',
      error: error.error || error.message,
    }
  }
}

// 文件上传方法
export const uploadFile = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  return response.data
}

export default api