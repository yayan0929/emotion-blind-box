import express, { Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

import { errorHandler } from '@/middleware/errorHandler'
import { notFound } from '@/middleware/notFound'
import authRoutes from '@/routes/auth'
import userRoutes from '@/routes/users'
import boxRoutes from '@/routes/boxes'
import replyRoutes from '@/routes/replies'
import uploadRoutes from '@/routes/upload'
import adminRoutes from '@/routes/admin'
import settingsRoutes from '@/routes/settings'

// 配置环境变量
dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 3001

// 获取当前目录路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// CORS配置
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL].filter(Boolean) as string[]
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];

// 如果有额外的允许源，添加到列表
if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

// 请求压缩
app.use(compression())

// 请求日志
app.use(morgan('combined'))

// 请求解析
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// 临时禁用API限流 - 开发环境
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分钟
//   max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 开发环境限制1000个，生产环境限制100个请求
//   message: {
//     success: false,
//     message: '请求过于频繁，请稍后再试'
//   }
// })
// app.use('/api/', limiter)

// 认证限流 - 开发环境放宽限制
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: process.env.NODE_ENV === 'development' ? 200 : 5, // 开发环境限制200次，生产环境限制5次
  message: {
    success: false,
    message: '认证请求过于频繁，请稍后再试'
  }
})

// 健康检查
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  })
})

// API路由
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/boxes', boxRoutes)
app.use('/api/replies', replyRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/settings', settingsRoutes)

// 404处理
app.use(notFound)

// 错误处理
app.use(errorHandler)

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`)
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📊 健康检查: http://localhost:${PORT}/health`)
  console.log(`📡 本地网络访问地址: http://0.0.0.0:${PORT}`)
  
  // 获取本机IP地址
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      // 跳过内部地址和非IPv4地址
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`🌐 外部访问地址: http://${net.address}:${PORT}`);
        console.log(`📱 移动设备访问地址: http://${net.address}:${PORT}`);
      }
    }
  }
})

export default app