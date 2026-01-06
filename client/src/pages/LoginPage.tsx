import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { cn } from '@/lib/utils'

interface LoginForm {
  phone: string
  password: string
  verificationCode: string
  loginType: 'password' | 'code'
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login: authLogin, isLoading } = useAuth()
  const [loginMethod, setLoginMethod] = useState<'password' | 'code'>('password')
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [sendingCode, setSendingCode] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<LoginForm>()

  const phone = watch('phone')

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
      const response = await authService.sendVerificationCode(phone, 'LOGIN')
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

  // 登录提交
  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await authLogin(
        data.phone,
        data.loginType === 'password' ? data.password : data.verificationCode
      )
      
      if (result.success) {
        navigate('/')
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert('登录失败，请重试')
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
            一个温暖的匿名情绪互助平台
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>登录账号</CardTitle>
            <CardDescription>
              选择您的登录方式
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* 登录方式选择 */}
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="password"
                    checked={loginMethod === 'password'}
                    onChange={() => setLoginMethod('password')}
                    className="mr-2"
                  />
                  <span>密码登录</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="code"
                    checked={loginMethod === 'code'}
                    onChange={() => setLoginMethod('code')}
                    className="mr-2"
                  />
                  <span>验证码登录</span>
                </label>
              </div>

              {/* 手机号输入 */}
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
              />

              {/* 密码输入 */}
              {loginMethod === 'password' && (
                <Input
                  id="password"
                  label="密码"
                  type="password"
                  placeholder="请输入密码"
                  {...register('password', {
                    required: loginMethod === 'password' ? '请输入密码' : false
                  })}
                  error={errors.password?.message}
                />
              )}

              {/* 验证码输入 */}
              {loginMethod === 'code' && (
                <div className="flex space-x-2">
                  <Input
                    id="verificationCode"
                    label="验证码"
                    type="text"
                    placeholder="请输入验证码"
                    {...register('verificationCode', {
                      required: loginMethod === 'code' ? '请输入验证码' : false,
                      pattern: {
                        value: /^\d{6}$/,
                        message: '验证码必须是6位数字'
                      }
                    })}
                    error={errors.verificationCode?.message}
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
              )}

              {/* 登录按钮 */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                loading={isLoading}
              >
                {loginMethod === 'password' ? '密码登录' : '验证码登录'}
              </Button>

              {/* 忘记密码 */}
              {loginMethod === 'password' && (
                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    忘记密码？
                  </Link>
                </div>
              )}

              {/* 注册链接 */}
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  还没有账号？{' '}
                </span>
                <Link
                  to="/register"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  立即注册
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}