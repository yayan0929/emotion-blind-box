import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/utils'

interface RegisterForm {
  username: string
  password: string
  confirmPassword: string
  phone: string
  studentId?: string
  school?: string
  grade?: string
  isAnonymous: boolean
  anonymousName: string
  verificationCode: string
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register: authRegister, isLoading } = useAuth()
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [sendingCode, setSendingCode] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterForm>()

  const phone = watch('phone')
  const isAnonymous = watch('isAnonymous')

  // 倒计时逻辑
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入有效的手机号')
      return
    }

    setSendingCode(true)
    try {
      const response = await authService.sendVerificationCode(phone, 'REGISTER')
      if (response.success) {
        setCodeSent(true)
        setCountdown(60) // 60秒倒计时
      } else {
        alert(response.message)
      }
    } catch (error: any) {
      alert(error.message || '发送验证码失败')
    } finally {
      setSendingCode(false)
    }
  }

  // 注册提交
  const onSubmit = async (data: RegisterForm) => {
    // 检查密码是否一致
    if (data.password !== data.confirmPassword) {
      alert('两次输入的密码不一致')
      return
    }

    try {
      const result = await authRegister({
        username: data.username,
        password: data.password,
        phone: data.phone,
        studentId: data.studentId,
        school: data.school,
        grade: data.grade,
        isAnonymous: data.isAnonymous,
        anonymousName: data.anonymousName,
        verificationCode: data.verificationCode
      })
      
      if (result.success) {
        navigate('/')
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert('注册失败，请重试')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            情绪盲盒交换站
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            加入我们，分享你的情绪故事
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>注册账号</CardTitle>
            <CardDescription>
              填写以下信息完成注册
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* 用户名 */}
              <Input
                id="username"
                label="用户名"
                type="text"
                placeholder="请输入用户名"
                {...register('username', {
                  required: '请输入用户名',
                  minLength: {
                    value: 3,
                    message: '用户名至少3个字符'
                  },
                  maxLength: {
                    value: 30,
                    message: '用户名最多30个字符'
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: '用户名只能包含字母、数字和下划线'
                  }
                })}
                error={errors.username?.message}
              />

              {/* 密码 */}
              <Input
                id="password"
                label="密码"
                type="password"
                placeholder="请输入密码"
                {...register('password', {
                  required: '请输入密码',
                  minLength: {
                    value: 6,
                    message: '密码至少6个字符'
                  },
                  maxLength: {
                    value: 50,
                    message: '密码最多50个字符'
                  }
                })}
                error={errors.password?.message}
              />

              {/* 确认密码 */}
              <Input
                id="confirmPassword"
                label="确认密码"
                type="password"
                placeholder="请再次输入密码"
                {...register('confirmPassword', {
                  required: '请确认密码'
                })}
                error={errors.confirmPassword?.message}
              />

              {/* 手机号 */}
              <div className="flex space-x-2">
                <Input
                  id="phone"
                  label="手机号"
                  type="tel"
                  placeholder="请输入手机号"
                  {...register('phone', {
                    required: '请输入手机号',
                    pattern: {
                      value: /^1[3-9]\d{9}$/,
                      message: '请输入有效的手机号'
                    }
                  })}
                  error={errors.phone?.message}
                  containerClassName="flex-1"
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendCode}
                    disabled={!phone || !/^1[3-9]\d{9}$/.test(phone) || countdown > 0 || sendingCode}
                    loading={sendingCode}
                  >
                    {countdown > 0 ? `${countdown}s` : codeSent ? '重新发送' : '获取验证码'}
                  </Button>
                </div>
              </div>

              {/* 验证码 */}
              <Input
                id="verificationCode"
                label="验证码"
                type="text"
                placeholder="请输入验证码"
                {...register('verificationCode', {
                  required: '请输入验证码',
                  pattern: {
                    value: /^\d{6}$/,
                    message: '验证码必须是6位数字'
                  }
                })}
                error={errors.verificationCode?.message}
              />

              {/* 学号（可选） */}
              <Input
                id="studentId"
                label="学号（可选）"
                type="text"
                placeholder="请输入学号"
                {...register('studentId')}
                error={errors.studentId?.message}
              />

              {/* 学校（可选） */}
              <Input
                id="school"
                label="学校（可选）"
                type="text"
                placeholder="请输入学校名称"
                {...register('school')}
                error={errors.school?.message}
              />

              {/* 年级（可选） */}
              <Input
                id="grade"
                label="年级（可选）"
                type="text"
                placeholder="请输入年级，如：大三"
                {...register('grade')}
                error={errors.grade?.message}
              />

              {/* 是否匿名 */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    {...register('isAnonymous')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    defaultChecked={true}
                  />
                  <span className="text-sm text-gray-700">使用匿名身份（推荐）</span>
                </label>
                <p className="text-xs text-gray-500">
                  启用匿名后，您的真实身份将对其他用户隐藏，仅使用匿名昵称显示
                </p>
              </div>

              {/* 匿名昵称 */}
              <Input
                id="anonymousName"
                label="匿名昵称"
                type="text"
                placeholder="请输入匿名昵称"
                {...register('anonymousName', {
                  required: '请输入匿名昵称',
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

              {/* 注册按钮 */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                loading={isLoading}
              >
                注册账号
              </Button>

              {/* 登录链接 */}
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  已有账号？{' '}
                </span>
                <Link
                  to="/login"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  立即登录
                </Link>
              </div>

              {/* 服务条款 */}
              <p className="text-xs text-gray-500 text-center">
                注册即表示您同意我们的
                <Link to="/terms" className="text-primary-600 hover:text-primary-500">服务条款</Link>
                和
                <Link to="/privacy" className="text-primary-600 hover:text-primary-500">隐私政策</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}