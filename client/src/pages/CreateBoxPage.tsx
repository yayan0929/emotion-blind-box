import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { boxService } from '@/services/boxService'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface CreateBoxForm {
  title: string
  content: string
  images: string[]
  isPublic: boolean
  allowReply: boolean
}

export const CreateBoxPage: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CreateBoxForm>({
    defaultValues: {
      images: [],
      isPublic: true,
      allowReply: true
    }
  })

  const watchImages = watch('images')

  // 提交表单
  const onSubmit = async (data: CreateBoxForm) => {
    setIsLoading(true)
    try {
      const response = await boxService.createBox({
        title: data.title || undefined,
        content: data.content,
        images: data.images,
        isPublic: data.isPublic,
        allowReply: data.allowReply
      })
      
      if (response.success) {
        alert('盲盒发布成功！')
        navigate(`/box/${response.data.box.id}`)
      } else {
        alert(response.message || '发布失败')
      }
    } catch (error: any) {
      console.error('发布盲盒失败:', error)
      alert(error.message || '发布失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 预览图片
  const handleImagePreview = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">发布情绪盲盒</h1>
        <p className="mt-4 text-lg text-gray-500">
          分享你的情绪故事，让温暖传递
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>盲盒内容</CardTitle>
          <CardDescription>
            请填写以下内容，其他用户将随机抽取到你的盲盒
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 标题（可选） */}
            <Input
              id="title"
              label="标题（可选）"
              type="text"
              placeholder="给你的情绪一个标题"
              {...register('title', {
                maxLength: {
                  value: 100,
                  message: '标题不能超过100个字符'
                }
              })}
              error={errors.title?.message}
            />

            {/* 内容 */}
            <Textarea
              id="content"
              label="内容 *"
              placeholder="分享你的情绪、烦恼、快乐或任何你想表达的故事..."
              rows={8}
              {...register('content', {
                required: '内容不能为空',
                minLength: {
                  value: 10,
                  message: '内容至少需要10个字符'
                },
                maxLength: {
                  value: 2000,
                  message: '内容不能超过2000个字符'
                }
              })}
              error={errors.content?.message}
            />

            {/* 图片上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                图片（可选）
              </label>
              <ImageUpload
                value={watchImages}
                onChange={(urls) => setValue('images', urls)}
                maxFiles={3}
                disabled={isLoading}
              />
              <p className="mt-2 text-xs text-gray-500">
                最多上传3张图片，每张不超过5MB，支持JPG、PNG、WebP格式
              </p>
            </div>

            {/* 设置选项 */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  {...register('isPublic')}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  defaultChecked={true}
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  公开盲盒（允许其他用户抽取）
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowReply"
                  {...register('allowReply')}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  defaultChecked={true}
                />
                <label htmlFor="allowReply" className="ml-2 block text-sm text-gray-700">
                  允许回复（其他用户可以对你的盲盒进行回复）
                </label>
              </div>
            </div>

            {/* 温馨提示 */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">温馨提示</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>你的身份信息将完全匿名，仅显示匿名昵称</li>
                      <li>请遵守社区规范，不要发布违法违规内容</li>
                      <li>一旦有用户抽取你的盲盒，内容将无法修改</li>
                      <li>分享真实的情绪，才能得到真诚的回应</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                className="flex-1"
              >
                发布盲盒
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}