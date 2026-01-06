import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 根据日期创建子目录
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    
    const dateDir = path.join(uploadDir, `${year}-${month}-${day}`)
    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true })
    }
    
    cb(null, dateDir)
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const ext = path.extname(file.originalname).toLowerCase()
    const filename = `${uuidv4()}${ext}`
    cb(null, filename)
  }
})

// 文件过滤器
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // 允许的文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('不支持的文件类型，仅支持 JPG、PNG 和 WebP 格式'), false)
  }
}

// 配置multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 默认5MB
  }
})

// 单个文件上传
router.post('/single', authMiddleware, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      })
    }

    // 构建文件URL
    const fileUrl = `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`

    res.status(201).json({
      success: true,
      message: '文件上传成功',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      }
    })
  } catch (error) {
    next(error)
  }
})

// 多个文件上传
router.post('/multiple', authMiddleware, upload.array('files', 5), async (req, res, next) => {
  try {
    const files = req.files as Express.Multer.File[]
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      })
    }

    // 构建文件URL列表
    const uploadedFiles = files.map(file => {
      const fileUrl = `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`
      return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: fileUrl
      }
    })

    res.status(201).json({
      success: true,
      message: `${files.length} 个文件上传成功`,
      data: {
        files: uploadedFiles
      }
    })
  } catch (error) {
    next(error)
  }
})

// 删除文件
router.delete('/:filename', authMiddleware, async (req, res, next) => {
  try {
    const { filename } = req.params
    
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: '文件名不能为空'
      })
    }

    // 查找文件
    const filePath = path.join(uploadDir, filename)
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      })
    }

    // 删除文件
    fs.unlinkSync(filePath)

    res.json({
      success: true,
      message: '文件删除成功'
    })
  } catch (error) {
    next(error)
  }
})

export default router