import React from 'react'
import { cn } from '@/lib/utils'
import { generateAvatarUrl } from '@/utils/helpers'

interface AvatarProps {
  src?: string
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallback?: string
  username?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'md',
  className,
  fallback,
  username
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl'
  }

  const [imageError, setImageError] = React.useState(false)
  
  // 生成头像URL或使用回退字符
  const avatarUrl = src && !imageError ? src : (username ? generateAvatarUrl(username) : undefined)
  const displayFallback = !src || imageError || !avatarUrl

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-secondary-100 font-medium text-secondary-800',
        sizeClasses[size],
        className
      )}
    >
      {displayFallback ? (
        <span className="uppercase">{fallback || (username ? username.substring(0, 2) : 'U')}</span>
      ) : (
        <img
          src={avatarUrl}
          alt={alt}
          className="h-full w-full rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  )
}