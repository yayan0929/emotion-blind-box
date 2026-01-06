import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Alert } from '@/components/ui/Alert'

export const SettingsPage: React.FC = () => {
  const { user, updateUserProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // 表单状态
  const [formData, setFormData] = useState({
    username: user?.username || '',
    anonymousName: user?.anonymousName || '',
    school: user?.school || '',
    grade: user?.grade || '',
    phone: user?.phone || '',
    studentId: user?.studentId || ''
  })
  
  // 密码修改状态
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        anonymousName: user.anonymousName || '',
        school: user.school || '',
        grade: user.grade || '',
        phone: user.phone || '',
        studentId: user.studentId || ''
      })
    }
  }, [user])
  
  // 处理基本信息表单变化
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // 处理密码表单变化
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // 保存基本信息
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    
    setIsSaving(true)
    setMessage(null)
    
    try {
      const response = await updateUserProfile(formData)
      
      if (response.success) {
        setMessage({ type: 'success', text: '个人信息更新成功' })
      } else {
        setMessage({ type: 'error', text: response.message || '更新失败，请重试' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '更新失败，请重试' })
    } finally {
      setIsSaving(false)
    }
  }
  
  // 修改密码
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setMessage({ type: 'error', text: '请输入当前密码和新密码' })
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '新密码和确认密码不一致' })
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: '新密码长度至少6位' })
      return
    }
    
    setIsSaving(true)
    setMessage(null)
    
    try {
      // 这里需要调用修改密码的API，目前先模拟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      setMessage({ type: 'success', text: '密码修改成功' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '密码修改失败，请重试' })
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">个人设置</h1>
        <p className="mt-1 text-sm text-gray-500">
          管理您的个人信息和账户设置
        </p>
      </div>
      
      {message && (
        <Alert type={message.type}>
          {message.text}
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>
              这些信息将显示在您的个人资料中
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  用户名
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleFormChange}
                  disabled
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-gray-500">用户名不可修改</p>
              </div>
              
              <div>
                <label htmlFor="anonymousName" className="block text-sm font-medium text-gray-700">
                  匿名昵称
                </label>
                <Input
                  id="anonymousName"
                  name="anonymousName"
                  type="text"
                  value={formData.anonymousName}
                  onChange={handleFormChange}
                  className="mt-1"
                  placeholder="发布匿名内容时显示的昵称"
                />
              </div>
              
              <div>
                <label htmlFor="school" className="block text-sm font-medium text-gray-700">
                  学校
                </label>
                <Input
                  id="school"
                  name="school"
                  type="text"
                  value={formData.school}
                  onChange={handleFormChange}
                  className="mt-1"
                  placeholder="您的学校名称"
                />
              </div>
              
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
                  年级
                </label>
                <Input
                  id="grade"
                  name="grade"
                  type="text"
                  value={formData.grade}
                  onChange={handleFormChange}
                  className="mt-1"
                  placeholder="您的年级"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  手机号
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="mt-1"
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">手机号不可修改</p>
              </div>
              
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                  学号
                </label>
                <Input
                  id="studentId"
                  name="studentId"
                  type="text"
                  value={formData.studentId}
                  onChange={handleFormChange}
                  className="mt-1"
                  placeholder="您的学号"
                />
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? '保存中...' : '保存基本信息'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* 修改密码 */}
        <Card>
          <CardHeader>
            <CardTitle>修改密码</CardTitle>
            <CardDescription>
              为了账户安全，请定期更换密码
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  当前密码
                </label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="mt-1"
                  placeholder="请输入当前密码"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  新密码
                </label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="mt-1"
                  placeholder="请输入新密码（至少6位）"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  确认新密码
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="mt-1"
                  placeholder="请再次输入新密码"
                  required
                  minLength={6}
                />
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  variant="outline"
                  className="w-full"
                >
                  {isSaving ? '修改中...' : '修改密码'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage