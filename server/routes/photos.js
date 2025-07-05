import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { query } from '../config/database.js'

const router = express.Router()

// 修改上传目录
const uploadDir = 'uploads/items'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  },
})

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 只允许图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('只允许上传图片文件'), false)
  }
}

// 配置multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制5MB
  },
})

// 上传图片
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('📸 图片上传请求')

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片',
      })
    }

    // 构建图片URL
    const imageUrl = `/uploads/items/${req.file.filename}`

    console.log('✅ 图片上传成功:', imageUrl)

    res.json({
      success: true,
      message: '图片上传成功',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    })
  } catch (error) {
    console.error('❌ 图片上传失败:', error)
    res.status(500).json({
      success: false,
      message: '图片上传失败，请稍后重试',
    })
  }
})

// 删除图片
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    console.log('🗑️ 删除图片请求:', filename)

    const filePath = path.join(uploadDir, filename)

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '图片文件不存在',
      })
    }

    // 删除文件
    fs.unlinkSync(filePath)

    // 从数据库中删除相关记录
    const imageUrl = `/uploads/items/${filename}`
    await query('DELETE FROM photo WHERE url = ?', [imageUrl])

    console.log('✅ 图片删除成功:', filename)

    res.json({
      success: true,
      message: '图片删除成功',
    })
  } catch (error) {
    console.error('❌ 图片删除失败:', error)
    res.status(500).json({
      success: false,
      message: '图片删除失败，请稍后重试',
    })
  }
})

// 获取图片列表（可选，用于管理）
router.get('/', async (req, res) => {
  try {
    console.log('📋 获取图片列表请求')

    const { page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    // 查询总数
    const countResult = await query('SELECT COUNT(*) as total FROM photo')
    const total = countResult[0].total

    // 查询图片列表
    const photos = await query(
      'SELECT p.*, i.title as item_title FROM photo p LEFT JOIN item i ON p.item_id = i.id ORDER BY p.id DESC LIMIT ? OFFSET ?',
      [parseInt(limit), offset],
    )

    console.log('✅ 获取图片列表成功，总数:', total)

    res.json({
      success: true,
      data: {
        photos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('❌ 获取图片列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取图片列表失败',
    })
  }
})

export default router
