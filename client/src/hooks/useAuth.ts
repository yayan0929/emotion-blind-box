import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

export const useAuth = () => {
  const navigate = useNavigate()
  const [isInitialized, setIsInitialized] = useState(false)
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    updateUser,
    setLoading 
  } = useAuthStore()

  useEffect(() => {
    // 只初始化一次
    if (isInitialized) return
    
    setIsInitialized(true)
    
    // 如果token存在但没有用户信息，尝试获取当前用户信息
    if (token && !user) {
      setLoading(true)
      authService.getCurrentUser()
        .then(response => {
          if (response.success && response.data) {
            updateUser(response.data.user)
          } else {
            // 如果获取用户信息失败，清除认证状态
            logout()
          }
        })
        .catch(error => {
          console.error('获取用户信息失败:', error)
          logout()
        })
        .finally(() => {
          setLoading(false)
        })
    } else if (!token && !isLoading) {
      // 确保清理状态
      logout()
    }
  }, [isInitialized]) // 只依赖初始化标志

  const handleLogin = async (username: string, password: string) => {
    setLoading(true)
    console.log('handleLogin: 开始登录', { username })
    try {
      const response = await authService.login({ phone: username, password })
      console.log('handleLogin: API响应', response)
      console.log('handleLogin: response.success:', response.success)
      console.log('handleLogin: response.data:', response.data)
      
      if (response.success && response.data) {
        // 处理后端返回的数据结构
        const { user, tokens } = response.data
        const accessToken = tokens?.accessToken
        const refreshTokenValue = tokens?.refreshToken
        
        console.log('handleLogin: 解析数据', { user, accessToken, refreshTokenValue })
        console.log('handleLogin: user对象:', JSON.stringify(user, null, 2))
        console.log('handleLogin: accessToken存在:', !!accessToken)
        console.log('handleLogin: refreshTokenValue存在:', !!refreshTokenValue)
        
        if (user && accessToken) {
          console.log('handleLogin: 调用login函数')
          login(user, accessToken, refreshTokenValue)
          console.log('handleLogin: login函数调用完成')
          
          // 验证状态是否正确设置
          setTimeout(() => {
            const state = useAuthStore.getState()
            console.log('handleLogin: 验证状态', {
              isAuthenticated: state.isAuthenticated,
              hasUser: !!state.user,
              hasToken: !!state.token,
              userRole: state.user?.role
            })
          }, 100)
          
          return { success: true }
        } else {
          console.error('handleLogin: 数据格式错误', { user, accessToken })
          return { success: false, message: '登录响应数据格式错误' }
        }
      }
      console.log('handleLogin: API返回失败', response.message)
      return { success: false, message: response.message || '登录失败' }
    } catch (error: any) {
      console.error('handleLogin: 异常', error)
      return { success: false, message: error.message || '登录失败' }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (userData: any) => {
    setLoading(true)
    try {
      const response = await authService.register(userData)
      if (response.success && response.data) {
        // 处理后端返回的数据结构
        const { user, tokens } = response.data
        const accessToken = tokens?.accessToken
        const refreshTokenValue = tokens?.refreshToken
        
        if (user && accessToken) {
          login(user, accessToken, refreshTokenValue)
          return { success: true }
        } else {
          return { success: false, message: '注册响应数据格式错误' }
        }
      }
      return { success: false, message: response.message || '注册失败' }
    } catch (error: any) {
      return { success: false, message: error.message || '注册失败' }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUser,
    setLoading
  }
}