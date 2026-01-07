import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string, refreshToken?: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true, // 初始状态为加载中
      
      login: (user, token, refreshToken) => {
        console.log('authStore.login: 开始设置状态')
        console.log('authStore.login: user:', user)
        console.log('authStore.login: token存在:', !!token)
        console.log('authStore.login: refreshToken存在:', !!refreshToken)
        
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false
        })
        
        // 保存token到localStorage以便axios拦截器使用（不与Zustand persist冲突）
        localStorage.setItem('token', token)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }
        
        console.log('authStore.login: 状态设置完成')
        
        // 验证状态是否正确设置
        setTimeout(() => {
          const state = get()
          console.log('authStore.login: 验证状态', {
            isAuthenticated: state.isAuthenticated,
            hasUser: !!state.user,
            hasToken: !!state.token,
            userRole: state.user?.role
          })
        }, 50)
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false
        })
        
        // 清除localStorage中的token
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      },
      
      updateUser: (updatedUser) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...updatedUser }
          })
        }
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading })
      }
    }),
    {
      name: 'auth-storage',
      version: 1,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        // 状态恢复后检查一致性
        if (state) {
          // 如果有token但没有user，设为未认证
          if (state.token && !state.user) {
            state.isAuthenticated = false
            state.token = null
            state.refreshToken = null
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
          }
          // 设置加载完成
          state.isLoading = false
        }
      }
    }
  )
)