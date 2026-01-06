import React, { useState, useEffect } from 'react'
import { User } from '@/types'
import { adminService } from '@/services/adminService'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { formatRelativeTime, formatNumber } from '@/utils/helpers'
import { cn } from '@/lib/utils'

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  
  // 搜索和筛选条件
  const [search, setSearch] = useState('')
  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState('')
  const [isActive, setIsActive] = useState<string>('')

  // 加载用户列表
  useEffect(() => {
    loadUsers()
  }, [pagination.page, search, school, grade, isActive])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const response = await adminService.getAllUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        school: school || undefined,
        grade: grade || undefined,
        isActive: isActive === '' ? undefined : isActive === 'true'
      })
      
      if (response.success && response.data) {
        setUsers(response.data.users || [])
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('加载用户列表失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 切换用户状态
  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    const action = newStatus ? '激活' : '冻结'
    
    if (!confirm(`确定要${action}这个用户吗？`)) return
    
    setIsUpdating(true)
    try {
      const response = await adminService.updateUserStatus(userId, newStatus)
      if (response.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, isActive: newStatus }
            : user
        ))
        alert(`用户已${action}`)
      } else {
        alert(response.message || `${action}失败`)
      }
    } catch (error: any) {
      console.error(`${action}用户失败:`, error)
      alert(error.message || `${action}失败，请重试`)
    } finally {
      setIsUpdating(false)
    }
  }

  // 删除用户
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除这个用户吗？删除后所有相关数据将被清除且无法恢复。')) return
    
    setIsDeleting(true)
    try {
      const response = await adminService.deleteUser(userId)
      if (response.success) {
        setUsers(prev => prev.filter(user => user.id !== userId))
        alert('用户已删除')
      } else {
        alert(response.message || '删除失败')
      }
    } catch (error: any) {
      console.error('删除用户失败:', error)
      alert(error.message || '删除失败，请重试')
    } finally {
      setIsDeleting(false)
    }
  }

  // 处理页面变化
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  // 处理搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // 重置筛选
  const handleResetFilters = () => {
    setSearch('')
    setSchool('')
    setGrade('')
    setIsActive('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          管理平台所有注册用户
        </p>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle>搜索与筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="用户名、匿名昵称、手机号"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Input
              placeholder="学校"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            />
            <Input
              placeholder="年级"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">全部状态</option>
              <option value="true">活跃</option>
              <option value="false">已冻结</option>
            </select>
            <div className="flex space-x-2">
              <Button onClick={handleSearch}>搜索</Button>
              <Button variant="outline" onClick={handleResetFilters}>
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 用户列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>用户列表</CardTitle>
            <p className="text-sm text-gray-500">
              共 {formatNumber(pagination.total)} 个用户
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">没有找到符合条件的用户</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          用户
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          联系信息
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          学校信息
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          统计
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          注册时间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar
                                username={user.username}
                                size="sm"
                                fallback={user.username.charAt(0)}
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.isAnonymous ? user.anonymousName : user.username}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.role === 'ADMIN' ? '管理员' : '普通用户'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.phone}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.studentId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{user.school || '-'}</div>
                            <div className="text-xs text-gray-500">
                              {user.grade || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>盲盒: {user._count?.boxes || 0}</div>
                            <div>回复: {user._count?.replies || 0}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatRelativeTime(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={cn(
                              'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            )}>
                              {user.isActive ? '活跃' : '已冻结'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                disabled={isUpdating}
                                className={cn(
                                  user.isActive
                                    ? 'text-red-600 hover:text-red-700'
                                    : 'text-green-600 hover:text-green-700'
                                )}
                              >
                                {user.isActive ? '冻结' : '激活'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={isDeleting}
                                className="text-red-600 hover:text-red-700"
                              >
                                删除
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 分页 */}
              {pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    显示第 {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} 到{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} 条，共 {pagination.total} 条记录
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      上一页
                    </Button>
                    <span className="text-sm text-gray-700">
                      第 {pagination.page} 页，共 {pagination.totalPages} 页
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}