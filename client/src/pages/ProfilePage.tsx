import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { User, EmotionBox, Reply } from '@/types'
import { authService } from '@/services/authService'
import { boxService } from '@/services/boxService'
import { replyService } from '@/services/replyService'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { formatRelativeTime, truncateText } from '@/utils/helpers'
import { cn } from '@/lib/utils'

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'boxes' | 'replies' | 'likes' | 'settings'>('boxes')
  const [myBoxes, setMyBoxes] = useState<EmotionBox[]>([])
  const [myReplies, setMyReplies] = useState<Reply[]>([])
  const [likedReplies, setLikedReplies] = useState<Reply[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      anonymousName: user?.anonymousName || '',
      school: user?.school || '',
      grade: user?.grade || '',
      isAnonymous: user?.isAnonymous || true
    }
  })

  // 加载用户数据
  useEffect(() => {
    if (user) {
      Promise.all([
        loadUserBoxes(),
        loadUserReplies(),
        loadLikedReplies()
      ]).finally(() => {
        setIsLoading(false)
      })
    }
  }, [user])

  const loadUserBoxes = async () => {
    if (!user) return
    
    try {
      const response = await boxService.getUserBoxes(user.id)
      if (response.success && response.data) {
        // 处理images字段，将JSON字符串转换为数组
        const processedBoxes = (response.data.boxes || []).map((box: any) => ({
          ...box,
          images: typeof box.images === 'string' 
            ? JSON.parse(box.images || '[]') 
            : box.images || [],
          viewCount: box._count?.views || 0
        }))
        setMyBoxes(processedBoxes)
      }
    } catch (error) {
      console.error('加载用户盲盒失败:', error)
    }
  }

  const loadUserReplies = async () => {
    if (!user) return
    
    try {
      const response = await replyService.getUserReplies(user.id)
      if (response.success && response.data) {
        setMyReplies(response.data.replies || [])
      }
    } catch (error) {
      console.error('加载用户回复失败:', error)
    }
  }

  const loadLikedReplies = async () => {
    if (!user) return
    
    try {
      const response = await replyService.getUserLikedReplies(user.id)
      if (response.success && response.data) {
        setLikedReplies(response.data.replies || [])
      }
    } catch (error) {
      console.error('加载用户点赞失败:', error)
    }
  }

  // 更新用户信息
  const onSubmitProfile = async (data: any) => {
    setIsUpdatingProfile(true)
    try {
      const response = await authService.updateProfile({
        username: data.username,
        anonymousName: data.anonymousName,
        school: data.school,
        grade: data.grade,
        isAnonymous: data.isAnonymous
      })
      
      if (response.success && response.data) {
        updateUser(response.data.user)
        alert('个人信息更新成功')
      } else {
        alert(response.message || '更新失败')
      }
    } catch (error: any) {
      console.error('更新个人信息失败:', error)
      alert(error.message || '更新失败，请重试')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // 删除盲盒
  const handleDeleteBox = async (boxId: string) => {
    if (!confirm('确定要删除这个盲盒吗？删除后无法恢复。')) return
    
    try {
      const response = await boxService.deleteBox(boxId)
      if (response.success) {
        setMyBoxes(prev => prev.filter(box => box.id !== boxId))
        alert('盲盒已删除')
      } else {
        alert(response.message || '删除失败')
      }
    } catch (error: any) {
      console.error('删除盲盒失败:', error)
      alert(error.message || '删除失败，请重试')
    }
  }

  // 删除回复
  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('确定要删除这条回复吗？删除后无法恢复。')) return
    
    try {
      const response = await replyService.deleteReply(replyId)
      if (response.success) {
        setMyReplies(prev => prev.filter(reply => reply.id !== replyId))
        alert('回复已删除')
      } else {
        alert(response.message || '删除失败')
      }
    } catch (error: any) {
      console.error('删除回复失败:', error)
      alert(error.message || '删除失败，请重试')
    }
  }

  // 取消点赞
  const handleUnlikeReply = async (replyId: string) => {
    try {
      const response = await replyService.toggleLikeReply(replyId)
      if (response.success) {
        setLikedReplies(prev => prev.filter(reply => reply.id !== replyId))
        // 如果这条回复也在我的回复列表中，更新点赞数
        setMyReplies(prev => prev.map(reply => 
          reply.id === replyId 
            ? { ...reply, likeCount: Math.max(0, reply.likeCount - 1) }
            : reply
        ))
      } else {
        alert(response.message || '操作失败')
      }
    } catch (error: any) {
      console.error('取消点赞失败:', error)
      alert(error.message || '操作失败，请重试')
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">请先登录</p>
        <Link to="/login">
          <Button className="mt-4">前往登录</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <Avatar 
          username={user.username} 
          size="xl" 
          fallback={user.username.charAt(0)} 
          className="mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          {user.isAnonymous ? user.anonymousName : user.username}
        </h1>
        <p className="text-gray-500">
          {user.school && user.grade ? `${user.school} · ${user.grade}` : ''}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="boxes">我的盲盒</TabsTrigger>
          <TabsTrigger value="replies">我的回复</TabsTrigger>
          <TabsTrigger value="likes">我的点赞</TabsTrigger>
          <TabsTrigger value="settings">个人设置</TabsTrigger>
        </TabsList>
        
        {/* 我的盲盒 */}
        <TabsContent value="boxes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>我的盲盒</CardTitle>
              <CardDescription>你发布的所有情绪盲盒</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : myBoxes.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">还没有发布盲盒</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    分享你的情绪故事，让更多人了解你
                  </p>
                  <div className="mt-6">
                    <Link to="/create">
                      <Button>发布盲盒</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {myBoxes.map((box) => (
                    <div key={box.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          {box.title && (
                            <h3 className="text-lg font-medium text-gray-900">{box.title}</h3>
                          )}
                          <p className="text-sm text-gray-500">
                            {formatRelativeTime(box.createdAt)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Link to={`/box/${box.id}`}>
                            <Button variant="outline" size="sm">查看</Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBox(box.id)}
                          >
                            删除
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">
                        {truncateText(box.content, 150)}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {box.viewCount}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {box._count?.replies || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 我的回复 */}
        <TabsContent value="replies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>我的回复</CardTitle>
              <CardDescription>你对其他盲盒的所有回复</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : myReplies.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">还没有回复过</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    去首页抽取盲盒，分享你的温暖和建议
                  </p>
                  <div className="mt-6">
                    <Link to="/">
                      <Button>抽取盲盒</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {myReplies.map((reply) => (
                    <div key={reply.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm text-gray-500">
                            回复给: <span className="font-medium">
                              {reply.box?.title ? reply.box.title : '某个盲盒'}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatRelativeTime(reply.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {reply.likeCount || 0}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReply(reply.id)}
                          >
                            删除
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-800 text-sm whitespace-pre-wrap">
                        {reply.content}
                      </p>
                      <div className="mt-2">
                        <Link to={`/box/${reply.boxId}`}>
                          <Button variant="outline" size="sm">查看盲盒</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 我的点赞 */}
        <TabsContent value="likes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>我的点赞</CardTitle>
              <CardDescription>你点赞过的所有回复</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : likedReplies.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">还没有点赞过</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    点赞那些让你感动的回复，鼓励更多温暖的分享
                  </p>
                  <div className="mt-6">
                    <Link to="/">
                      <Button>抽取盲盒</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {likedReplies.map((reply) => (
                    <div key={reply.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm text-gray-500">
                            回复者: <span className="font-medium">{reply.user?.anonymousName}</span>
                          </p>
                          <p className="text-sm text-gray-500">
                            回复给: <span className="font-medium">
                              {reply.box?.title ? reply.box.title : '某个盲盒'}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatRelativeTime(reply.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {reply.likeCount || 0}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnlikeReply(reply.id)}
                          >
                            取消点赞
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-800 text-sm whitespace-pre-wrap">
                        {reply.content}
                      </p>
                      <div className="mt-2">
                        <Link to={`/box/${reply.boxId}`}>
                          <Button variant="outline" size="sm">查看盲盒</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 个人设置 */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>个人设置</CardTitle>
              <CardDescription>更新你的个人信息和偏好设置</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
                <Input
                  id="username"
                  label="用户名"
                  type="text"
                  {...register('username', {
                    required: '用户名不能为空',
                    minLength: {
                      value: 3,
                      message: '用户名至少3个字符'
                    },
                    maxLength: {
                      value: 30,
                      message: '用户名最多30个字符'
                    }
                  })}
                  error={errors.username?.message}
                />
                
                <Input
                  id="anonymousName"
                  label="匿名昵称"
                  type="text"
                  {...register('anonymousName', {
                    required: '匿名昵称不能为空',
                    minLength: {
                      value: 2,
                      message: '匿名昵称至少2个字符'
                    },
                    maxLength: {
                      value: 20,
                      message: '匿名昵称最多20个字符'
                    }
                  })}
                  error={errors.anonymousName?.message}
                />
                
                <Input
                  id="school"
                  label="学校"
                  type="text"
                  {...register('school')}
                  error={errors.school?.message}
                />
                
                <Input
                  id="grade"
                  label="年级"
                  type="text"
                  {...register('grade')}
                  error={errors.grade?.message}
                />
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    {...register('isAnonymous')}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-700">
                    默认使用匿名身份
                  </label>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isUpdatingProfile}
                    loading={isUpdatingProfile}
                  >
                    保存设置
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}