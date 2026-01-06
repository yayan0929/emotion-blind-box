import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Layout } from '@/components/Layout'
import { LoadingSpinner } from '@/components/LoadingSpinner'

// 页面组件
import { SimpleLoginPage as LoginPage } from '@/pages/SimpleLoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { HomePage } from '@/pages/HomePage'
import { BoxDetailPage } from '@/pages/BoxDetailPage'
import { CreateBoxPage } from '@/pages/CreateBoxPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { RandomBoxPage } from '@/pages/RandomBoxPage'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminUsers } from '@/pages/admin/AdminUsers'
import AdminBoxes from '@/pages/admin/AdminBoxes'
import AdminReplies from '@/pages/admin/AdminReplies'
import AdminSettings from '@/pages/admin/AdminSettings'
import { NotFoundPage } from '@/pages/NotFoundPage'

function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  // 监听全局登出事件
  useEffect(() => {
    const handleLogout = () => {
      logout()
      // 使用 window.location.pathname 而不是 navigate，确保完全重置应用状态
      if (window.location.pathname !== '/login') {
        window.location.pathname = '/login'
      }
    }
    
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [logout])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      {/* 公开路由 */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      
      {/* 需要认证的路由 */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/box/:id" element={<BoxDetailPage />} />
                <Route path="/create" element={<CreateBoxPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/random" element={<RandomBoxPage />} />
                
                {/* 管理员路由 */}
                {user?.role === 'ADMIN' ? (
                  <Route path="/admin/*" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="boxes" element={<AdminBoxes />} />
                    <Route path="replies" element={<AdminReplies />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                ) : null}
                
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

export default App