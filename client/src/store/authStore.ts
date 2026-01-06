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