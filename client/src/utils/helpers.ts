import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 格式化日期时间
export const formatDateTime = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
  } catch (error) {
    return dateString
  }
}

// 格式化相对时间
export const formatRelativeTime = (dateString: string): string => {
  try {
    return formatDistanceToNow(parseISO(dateString), { 
      addSuffix: true, 
      locale: zhCN 
    })
  } catch (error) {
    return dateString
  }
}

// 格式化短日期
export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'MM月dd日', { locale: zhCN })
  } catch (error) {
    return dateString
  }
}

// 截断文本
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 手机号脱敏
export const maskPhone = (phone: string): string => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 学号脱敏
export const maskStudentId = (studentId: string): string => {
  if (!studentId) return ''
  if (studentId.length <= 4) return studentId
  return studentId.substring(0, 2) + '*'.repeat(studentId.length - 4) + studentId.substring(studentId.length - 2)
}

// 生成随机颜色
export const generateRandomColor = (): string => {
  const colors = [
    '#f87171', '#fb923c', '#fbbf24', '#a3e635', 
    '#4ade80', '#34d399', '#2dd4bf', '#22d3ee',
    '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa',
    '#c084fc', '#e879f9', '#f472b6'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 生成随机头像URL
export const generateAvatarUrl = (seed: string): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`
}

// 复制到剪贴板
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

// 检测是否为移动设备
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= 768
}

// 防抖函数
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number | null = null
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// 节流函数
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 格式化数字（添加千分位分隔符）
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取文件扩展名
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 验证URL
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 生成随机ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}