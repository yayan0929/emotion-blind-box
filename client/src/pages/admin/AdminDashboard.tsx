import React, { useState, useEffect } from 'react'
import { adminService } from '@/services/adminService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { formatNumber } from '@/utils/helpers'

interface StatsData {
  overview: {
    totalUsers: number
    totalBoxes: number
    totalReplies: number
    totalLikes: number
    newUsers: number
    newBoxes: number
    newReplies: number
    newLikes: number
  }
  violations: {
    inactiveUsers: number
    archivedBoxes: number
    deletedReplies: number
  }
  dailyStats: Array<{
    date: string
    users: number
    boxes: number
    replies: number
    likes: number
  }>
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('7')

  useEffect(() => {
    loadStats()
  }, [period])

  const loadStats = async () => {
    setIsLoading(true)
    try {
      const response = await adminService.getStats(period)
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('加载统计数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="mt-1 text-sm text-gray-500">
          系统运营数据和统计信息
        </p>
      </div>

      {/* 时间段选择 */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">数据时间范围:</label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
        >
          <option value="7">最近7天</option>
          <option value="30">最近30天</option>
          <option value="90">最近90天</option>
        </select>
      </div>

      {stats && (
        <>
          {/* 概览统计 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-600">总用户数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatNumber(stats.overview.totalUsers)}
                  </div>
                  <div className="ml-2 text-sm font-medium text-green-600">
                    +{formatNumber(stats.overview.newUsers)}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">新增用户</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-600">总盲盒数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatNumber(stats.overview.totalBoxes)}
                  </div>
                  <div className="ml-2 text-sm font-medium text-green-600">
                    +{formatNumber(stats.overview.newBoxes)}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">新增盲盒</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-600">总回复数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatNumber(stats.overview.totalReplies)}
                  </div>
                  <div className="ml-2 text-sm font-medium text-green-600">
                    +{formatNumber(stats.overview.newReplies)}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">新增回复</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-600">总点赞数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatNumber(stats.overview.totalLikes)}
                  </div>
                  <div className="ml-2 text-sm font-medium text-green-600">
                    +{formatNumber(stats.overview.newLikes)}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">新增点赞</p>
              </CardContent>
            </Card>
          </div>

          {/* 违规统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-600">被冻结用户</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-red-600">
                  {formatNumber(stats.violations.inactiveUsers)}
                </div>
                <p className="text-xs text-gray-500 mt-1">因违规被冻结的用户</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-600">被下架盲盒</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-red-600">
                  {formatNumber(stats.violations.archivedBoxes)}
                </div>
                <p className="text-xs text-gray-500 mt-1">因违规被下架的盲盒</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-gray-600">被删除回复</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-red-600">
                  {formatNumber(stats.violations.deletedReplies)}
                </div>
                <p className="text-xs text-gray-500 mt-1">因违规被删除的回复</p>
              </CardContent>
            </Card>
          </div>

          {/* 数据趋势 */}
          <Card>
            <CardHeader>
              <CardTitle>数据趋势</CardTitle>
              <CardDescription>
                过去{period}天的用户活跃度、内容发布和互动情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-center text-sm font-medium text-gray-600 pb-2 border-b">
                  <div>日期</div>
                  <div>新用户</div>
                  <div>新盲盒</div>
                  <div>新回复</div>
                </div>
                {stats.dailyStats.map((day, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 text-center text-sm py-2 border-b border-gray-100">
                    <div>{day.date}</div>
                    <div>{day.users}</div>
                    <div>{day.boxes}</div>
                    <div>{day.replies}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}