import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-500">404</h1>
        </div>
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">页面不存在</h2>
          <p className="mt-4 text-lg text-gray-500">
            抱歉，您访问的页面可能已被删除、更名或暂时不可用
          </p>
        </div>
        <div className="space-y-4">
          <Link to="/">
            <Button size="lg" className="w-full">
              返回首页
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" size="lg" className="w-full">
              个人中心
            </Button>
          </Link>
        </div>
        <div className="mt-8">
          <p className="text-sm text-gray-500">
            如果您认为这是一个错误，请联系我们的管理员
          </p>
        </div>
      </div>
    </div>
  )
}