import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmotionBox } from '@/types'
import { boxService } from '@/services/boxService'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { formatRelativeTime, truncateText } from '@/utils/helpers'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const [boxes, setBoxes] = useState<EmotionBox[]>([])
  const [featuredBoxes, setFeaturedBoxes] = useState<EmotionBox[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRandom, setIsLoadingRandom] = useState(false)
  const [activeTab, setActiveTab] = useState<'recent' | 'featured'>('recent')

  // 加载盲盒列表
  useEffect(() => {
    loadBoxes()
    loadFeaturedBoxes()
  }, [])

  const loadBoxes = async () => {
    try {
      const response = await boxService.getBoxes({ limit: 20 })
      if (response.success && response.data && response.data.boxes) {
        // 处理images字段，将JSON字符串转换为数组
        const processedBoxes = response.data.boxes.map(box => ({
          ...box,
          images: typeof box.images === 'string' 
            ? JSON.parse(box.images || '[]') 
            : box.images || [],
          viewCount: box._count?.views || 0
        }))
        setBoxes(processedBoxes)
      } else {
        setBoxes([])
      }
    } catch (error) {
      console.error('加载盲盒失败:', error)
      setBoxes([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadFeaturedBoxes = async () => {
    try {
      const response = await boxService.getBoxes({ limit: 6, isFeatured: true })
      if (response.success && response.data && response.data.boxes) {
        // 处理images字段，将JSON字符串转换为数组
        const processedBoxes = response.data.boxes.map(box => ({
          ...box,
          images: typeof box.images === 'string' 
            ? JSON.parse(box.images || '[]') 
            : box.images || [],
          viewCount: box._count?.views || 0
        }))
        setFeaturedBoxes(processedBoxes)
      } else {
        setFeaturedBoxes([])
      }
    } catch (error) {
      console.error('加载精选盲盒失败:', error)
      setFeaturedBoxes([])
    }
  }

  // 随机抽取盲盒
  const handleRandomBox = async () => {
    setIsLoadingRandom(true)
    try {
      const response = await boxService.getRandomBox()
      if (response.success && response.data) {
        // 导航到盲盒详情页
        navigate(`/box/${response.data.box.id}`)
      } else {
        alert(response.message || '抽取盲盒失败')
      }
    } catch (error) {
      console.error('抽取盲盒失败:', error)
      alert('抽取盲盒失败，请重试')
    } finally {
      setIsLoadingRandom(false)
    }
  }

  // 渲染盲盒卡片
  const renderBoxCard = (box: EmotionBox) => (
    <Card key={box.id} className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar 
              username={box.user?.anonymousName} 
              size="sm" 
              fallback={box.user?.anonymousName?.charAt(0)} 
            />
            <div>
              <p className="text-sm font-medium">{box.user?.anonymousName}</p>
              <p className="text-xs text-gray-500">{formatRelativeTime(box.createdAt)}</p>
            </div>
          </div>
          {box.isFeatured && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              精选
            </span>
          )}
        </div>
        {box.title && (
          <h3 className="text-lg font-medium text-gray-900 mt-2">{box.title}</h3>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 text-sm">
          {truncateText(box.content, 120)}
        </p>
        {box.images && box.images.length > 0 && (
          <div className="mt-3 flex space-x-2">
            {box.images.slice(0, 3).map((image, index) => (
              <div key={index} className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                <img
                  src={image}
                  alt={`图片 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {box.images.length > 3 && (
              <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                +{box.images.length - 3}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex items-center justify-between w-full text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {box._count?.views || 0}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {box._count?.replies || 0}
            </span>
          </div>
          <Link to={`/box/${box.id}`} className="text-primary-600 hover:text-primary-500 font-medium">
            查看详情
          </Link>
        </div>
      </CardFooter>
    </Card>
  )

  return (
    <div className="space-y-8">
      {/* 页面标题和操作 */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">
          情绪盲盒交换站
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
          在这里，你可以分享自己的情绪故事，也可以倾听他人的心声
        </p>
        <div className="mt-6 flex justify-center space-x-4">
          <Button
            onClick={handleRandomBox}
            loading={isLoadingRandom}
            size="lg"
          >
            随机抽取盲盒
          </Button>
          <Link to="/create">
            <Button variant="outline" size="lg">
              发布我的盲盒
            </Button>
          </Link>
        </div>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('recent')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recent'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            最新盲盒
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'featured'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            精选盲盒
          </button>
        </nav>
      </div>

      {/* 盲盒列表 */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'recent' ? (boxes || []) : (featuredBoxes || [])).map(renderBoxCard)}
        </div>
      )}

      {/* 无数据提示 */}
      {!isLoading && (activeTab === 'recent' ? (boxes || []) : (featuredBoxes || [])).length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {activeTab === 'recent' ? '暂无盲盒' : '暂无精选盲盒'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'recent' 
              ? '成为第一个分享情绪故事的人吧！'
              : '还没有盲盒被标记为精选'
            }
          </p>
          <div className="mt-6">
            <Link to="/create">
              <Button>发布盲盒</Button>
            </Link>
          </div>
        </div>
      )}

      {/* 加载更多 */}
      {!isLoading && (activeTab === 'recent' ? (boxes || []) : (featuredBoxes || [])).length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline">
            加载更多
          </Button>
        </div>
      )}
    </div>
  )
}