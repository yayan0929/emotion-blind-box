import React, { useRef, useState } from 'react'
import { Button } from './Button'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/utils/helpers'

interface ImageUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
  maxSize?: number // bytes
  className?: string
  disabled?: boolean
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  maxFiles = 3,
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // 检查文件数量
    if (value.length + files.length > maxFiles) {
      alert(`最多只能上传 ${maxFiles} 张图片`)
      return
    }

    setUploading(true)
    const newUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // 检查文件大小
        if (file.size > maxSize) {
          alert(`文件 "${file.name}" 大小超过限制 (${formatFileSize(maxSize)})`)
          continue
        }

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
          alert(`文件 "${file.name}" 不是有效的图片文件`)
          continue
        }

        // 上传文件
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload/single', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        })

        const result = await response.json()

        if (result.success) {
          newUrls.push(result.data.url)
        } else {
          alert(`上传文件 "${file.name}" 失败: ${result.message}`)
        }
      }

      if (newUrls.length > 0) {
        onChange([...value, ...newUrls])
      }
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = (index: number) => {
    const newUrls = [...value]
    newUrls.splice(index, 1)
    onChange(newUrls)
  }

  const handleUploadClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap gap-2">
        {value.map((url, index) => (
          <div key={index} className="relative h-24 w-24 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={url}
              alt={`上传的图片 ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 focus:outline-none"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
        
        {value.length < maxFiles && !disabled && (
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={uploading}
            className="h-24 w-24 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {uploading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
            ) : (
              <>
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="mt-1 text-xs text-gray-500">添加图片</span>
              </>
            )}
          </button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {value.length > 0 && (
        <p className="text-xs text-gray-500">
          已上传 {value.length}/{maxFiles} 张图片，每张不超过 {formatFileSize(maxSize)}
        </p>
      )}
    </div>
  )
}