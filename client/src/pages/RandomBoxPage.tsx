import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { boxService } from '@/services/boxService'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export const RandomBoxPage: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [randomBox, setRandomBox] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleRandomBox()
  }, [])

  const handleRandomBox = async () => {
    setIsLoading(true)
    setError(null)
    setRandomBox(null)
    
    try {
      const response = await boxService.getRandomBox()
      if (response.success && response.data) {
        setRandomBox(response.data.box)
        // 不直接导航，而是让用户可以选择是否查看
      } else {
        setError(response.message || '抽取盲盒失败')
      }
    } catch (error) {
      console.error('抽取盲盒失败:', error)
      setError('抽取盲盒失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewBox = () => {
    if (randomBox) {
      navigate(`/box/${randomBox.id}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">随机盲盒</h1>
        <p className="mt-4 text-lg text-gray-500">
          发现一个陌生人的情绪故事，给予温暖的回应
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>抽取盲盒</CardTitle>
          <CardDescription>
            每个盲盒都是一个真实的故事，一个值得倾听的声音
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-500">正在为你寻找一个有趣的盲盒...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">暂无可抽取的盲盒</h3>
              <p className="mt-1 text-sm text-gray-500">
                你已经看过了所有盲盒，或者还没有人发布盲盒
              </p>
              <div className="mt-6 space-y-4">
                <Button onClick={handleRandomBox} className="w-full">
                  再试一次
                </Button>
                <div className="text-sm text-gray-500">
                  或者，你可以：
                </div>
                <div className="space-y-2">
                  <Button variant="outline" onClick={() => navigate('/create')} className="w-full">
                    发布一个盲盒
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                    返回首页
                  </Button>
                </div>
              </div>
            </div>
          ) : randomBox ? (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-2">你抽到了一个盲盒！</h3>
                <p className="text-blue-700">
                  来自 {randomBox.user?.anonymousName} 的情绪故事
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                {randomBox.title && (
                  <h3 className="text-lg font-medium mb-2">{randomBox.title}</h3>
                )}
                <p className="text-gray-700 whitespace-pre-wrap">
                  {randomBox.content.length > 150 
                    ? `${randomBox.content.substring(0, 150)}...` 
                    : randomBox.content}
                </p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button onClick={handleViewBox} size="lg">
                  查看完整盲盒并回复
                </Button>
                <Button variant="outline" onClick={handleRandomBox}>
                  重新抽取
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Button onClick={handleRandomBox} size="lg">
                抽取一个盲盒
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}