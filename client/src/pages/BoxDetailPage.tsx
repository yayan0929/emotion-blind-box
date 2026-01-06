import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { EmotionBox, Reply } from '@/types'
import { boxService } from '@/services/boxService'
import { replyService } from '@/services/replyService'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Textarea } from '@/components/ui/Textarea'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { formatRelativeTime, copyToClipboard } from '@/utils/helpers'

export const BoxDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthenticated } = useAuth()
  const [box, setBox] = useState<EmotionBox | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [likedReplyIds, setLikedReplyIds] = useState<Set<string>>(new Set())
  const [showReplyForm, setShowReplyForm] = useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<{ content: string }>()

  // 加载盲盒详情
  useEffect(() => {
    if (id) {
      loadBoxDetails(id)
    }
  }, [id])

  const loadBoxDetails = async (boxId: string) => {
    setIsLoading(true)
    try {
      const response = await boxService.getBoxById(boxId)
      if (response.success && response.data) {
        // 处理images字段，将JSON字符串转换为数组
        const processedBox = {
          ...response.data.box,
          images: typeof response.data.box.images === 'string' 
            ? JSON.parse(response.data.box.images || '[]') 
            : response.data.box.images || [],
          viewCount: response.data.box._count?.views || 0
        }
        setBox(processedBox)
        setReplies(processedBox.replies || [])
        
        // 获取所有回复的点赞状态
        if (isAuthenticated) {
          await Promise.all(
            (response.data.box.replies || []).map(async (reply: Reply) => {
              const likeResponse = await replyService.getReplyLikeStatus(reply.id)
              if (likeResponse.success && likeResponse.data?.liked) {
                setLikedReplyIds(prev => new Set(prev).add(reply.id))
              }
            })
          )
        }
      }
    } catch (error) {
      console.error('加载盲盒详情失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 提交回复
  const onSubmitReply = async (data: { content: string }) => {
    if (!id) return
    
    setIsSubmittingReply(true)
    try {
      const response = await replyService.createReply({
        boxId: id,
        content: data.content
      })
      
      if (response.success && response.data) {
        // 添加新回复到列表
        setReplies(prev => [response.data!.reply, ...prev])
        reset()
        setShowReplyForm(false)
        alert('回复成功！')
      } else {
        alert(response.message || '回复失败')
      }
    } catch (error: any) {
      console.error('回复失败:', error)
      alert(error.message || '回复失败，请重试')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  // 删除回复（仅作者或管理员）
  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('确定要删除这条回复吗？')) return
    
    try {
      const response = await replyService.deleteReply(replyId)
      if (response.success) {
        setReplies(prev => prev.filter(reply => reply.id !== replyId))
        alert('回复已删除')
      } else {
        alert(response.message || '删除失败')
      }
    } catch (error: any) {
      console.error('删除回复失败:', error)
      alert(error.message || '删除失败，请重试')
    }
  }

  // 点赞/取消点赞回复
  const handleToggleLike = async (replyId: string) => {
    if (!isAuthenticated) {
      alert('请先登录后再进行点赞')
      return
    }
    
    try {
      const response = await replyService.toggleLikeReply(replyId)
      if (response.success && response.data) {
        const { liked } = response.data
        
        // 更新点赞状态
        setLikedReplyIds(prev => {
          const newSet = new Set(prev)
          if (liked) {
            newSet.add(replyId)
          } else {
            newSet.delete(replyId)
          }
          return newSet
        })
        
        // 更新回复的点赞数
        setReplies(prev => prev.map(reply => 
          reply.id === replyId 
            ? { ...reply, likeCount: reply.likeCount + (liked ? 1 : -1) }
            : reply
        ))
      } else {
        alert(response.message || '操作失败')
      }
    } catch (error: any) {
      console.error('点赞操作失败:', error)
      alert(error.message || '操作失败，请重试')
    }
  }

  // 复制盲盒内容
  const handleCopyContent = () => {
    if (box) {
      const content = `${box.title ? `${box.title}\n\n` : ''}${box.content}`
      copyToClipboard(content) ? alert('内容已复制到剪贴板') : alert('复制失败')
    }
  }

  // 分享盲盒
  const handleShare = () => {
    if (box) {
      const url = window.location.href
      copyToClipboard(url) ? alert('链接已复制到剪贴板') : alert('复制失败')
    }
  }

  // 加载中状态
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // 盲盒不存在
  if (!box) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">盲盒不存在</h2>
        <p className="mt-2 text-gray-500">您访问的盲盒可能已被删除或不存在</p>
        <div className="mt-6">
          <Link to="/">
            <Button>返回首页</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 盲盒内容 */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar 
                username={box.user?.anonymousName} 
                size="md" 
                fallback={box.user?.anonymousName?.charAt(0)} 
              />
              <div>
                <p className="text-lg font-medium">{box.user?.anonymousName}</p>
                <p className="text-sm text-gray-500">{formatRelativeTime(box.createdAt)}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={handleCopyContent}>
                复制内容
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                分享
              </Button>
            </div>
          </div>
          {box.title && (
            <h2 className="text-2xl font-bold mt-4">{box.title}</h2>
          )}
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {box.content}
            </p>
          </div>
          
          {/* 图片展示 */}
          {box.images && box.images.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {box.images.map((image, index) => (
                <div 
                  key={index} 
                  className="rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => window.open(image, '_blank')}
                >
                  <img
                    src={image}
                    alt={`图片 ${index + 1}`}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-between w-full text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {box.viewCount} 次查看
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {replies.length} 条回复
              </span>
            </div>
            {box.allowReply && isAuthenticated && (
              <Button
                onClick={() => setShowReplyForm(!showReplyForm)}
                variant="outline"
                size="sm"
              >
                {showReplyForm ? '取消回复' : '回复TA'}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* 回复表单 */}
      {showReplyForm && box.allowReply && (
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-lg font-medium">写下你的回复</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmitReply)} className="space-y-4">
              <Textarea
                placeholder="写下你温暖、鼓励的建议或想法..."
                rows={4}
                {...register('content', {
                  required: '回复内容不能为空',
                  minLength: {
                    value: 5,
                    message: '回复内容至少需要5个字符'
                  },
                  maxLength: {
                    value: 1000,
                    message: '回复内容不能超过1000个字符'
                  }
                })}
                error={errors.content?.message}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmittingReply}
                  loading={isSubmittingReply}
                >
                  发送回复
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 回复列表 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">全部回复 ({replies.length})</h3>
        
        {replies.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无回复</h3>
            <p className="mt-1 text-sm text-gray-500">
              成为第一个回复的人，分享你的温暖
            </p>
          </div>
        ) : (
          replies.map((reply) => (
            <Card key={reply.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar 
                      username={reply.user?.anonymousName} 
                      size="sm" 
                      fallback={reply.user?.anonymousName?.charAt(0)} 
                    />
                    <div>
                      <p className="font-medium">{reply.user?.anonymousName}</p>
                      <p className="text-sm text-gray-500">{formatRelativeTime(reply.createdAt)}</p>
                    </div>
                  </div>
                  {user && (user.id === reply.userId || user.role === 'ADMIN') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReply(reply.id)}
                    >
                      删除
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="whitespace-pre-wrap text-gray-800">{reply.content}</p>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleLike(reply.id)}
                    className={likedReplyIds.has(reply.id) ? 'text-red-500' : 'text-gray-500'}
                  >
                    <svg className="w-4 h-4 mr-1" fill={likedReplyIds.has(reply.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {reply.likeCount || 0}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}