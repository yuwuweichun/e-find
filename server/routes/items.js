import express from 'express'
import { body, validationResult } from 'express-validator'
import { query } from '../config/database.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

// 验证JWT token的中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌',
    })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    req.user = decoded
    next()
  } catch (error) {
    console.error('❌ Token验证失败:', error.message)
    return res.status(401).json({
      success: false,
      message: '无效的认证令牌',
    })
  }
}

// 获取所有物品列表（支持分页和搜索）
router.get('/', async (req, res) => {
  try {
    // 支持分页参数
    const { page = 1, limit = 20, search = '' } = req.query
    const pageNum = parseInt(page, 10) || 1
    const limitNum = parseInt(limit, 10) || 20
    const offset = (pageNum - 1) * limitNum

    // 搜索条件
    let where = 'WHERE 1=1'
    let params = []

    if (search && search.trim() !== '') {
      where += ' AND (title LIKE ? OR description LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    // 查询总数
    const countResult = await query(`SELECT COUNT(*) as total FROM item ${where}`, params)
    const total = countResult[0].total

    // 查询物品列表
    const items = await query(
      `SELECT i.*, u.username as publisher_name, u.full_name as publisher_full_name
       FROM item i
       LEFT JOIN user u ON i.publisher_id = u.id
       ${where}
       ORDER BY i.posted_date DESC
       LIMIT ${limitNum} OFFSET ${offset}`,
      params,
    )

    // 为每个物品获取图片
    for (let item of items) {
      const photos = await query('SELECT url FROM photo WHERE item_id = ?', [item.id])
      // 只取第一张图片作为封面
      item.photoUrl = photos.length > 0 ? photos[0].url : null
      item.photos = photos.map((photo) => photo.url)
    }

    res.json({
      success: true,
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('❌ 获取物品列表失败:', error.stack || error)
    res.status(500).json({
      success: false,
      message: '获取物品列表失败',
    })
  }
})

// 获取单个物品详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log('🔍 获取物品详情，ID:', id)

    const items = await query(
      `SELECT i.*, u.username as publisher_name, u.phone as publisher_phone, u.full_name as publisher_full_name
       FROM item i
       LEFT JOIN user u ON i.publisher_id = u.id
       WHERE i.id = ?`,
      [id],
    )

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: '物品不存在',
      })
    }

    const item = items[0]

    // 获取物品图片
    const photos = await query('SELECT url FROM photo WHERE item_id = ?', [id])
    item.photos = photos.map((photo) => photo.url)

    console.log('✅ 获取物品详情成功:', item.title)

    res.json({
      success: true,
      data: item,
    })
  } catch (error) {
    console.error('❌ 获取物品详情失败:', error)
    res.status(500).json({
      success: false,
      message: '获取物品详情失败',
    })
  }
})

// 发布新物品（需要登录）
router.post(
  '/',
  authenticateToken,
  [
    body('title').isLength({ min: 1, max: 100 }).withMessage('标题长度必须在1-100个字符之间'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('描述长度不能超过1000个字符'),
    body('type').isIn(['lost', 'found']).withMessage('类型必须是lost或found'),
    body('location').optional().isLength({ max: 255 }).withMessage('地点长度不能超过255个字符'),
    body('contact_info')
      .optional()
      .isLength({ max: 100 })
      .withMessage('联系方式长度不能超过100个字符'),
    body('lost_date').optional().isISO8601().withMessage('日期格式不正确'),
  ],
  async (req, res) => {
    try {
      console.log('📝 发布物品请求:', { ...req.body, publisher_id: req.user.id })

      // 验证输入
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        console.log('❌ 输入验证失败:', errors.array())
        return res.status(400).json({
          success: false,
          message: '输入验证失败',
          errors: errors.array(),
        })
      }

      const { title, description, type, location, contact_info, lost_date, photos = [] } = req.body

      // 插入物品记录
      const result = await query(
        `INSERT INTO item (publisher_id, type, title, description, location, lost_date, contact_info, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          req.user.id,
          type,
          title,
          description || null,
          location || null,
          lost_date || null,
          contact_info || null,
        ],
      )

      const itemId = result.insertId

      // 插入图片记录
      if (photos.length > 0) {
        for (const photoUrl of photos) {
          await query('INSERT INTO photo (item_id, url) VALUES (?, ?)', [itemId, photoUrl])
        }
      }

      console.log('✅ 物品发布成功，ID:', itemId)

      res.status(201).json({
        success: true,
        message: '物品发布成功，等待审核',
        data: {
          id: itemId,
          title,
          type,
          status: 'pending',
        },
      })
    } catch (error) {
      console.error('❌ 发布物品失败:', error)
      res.status(500).json({
        success: false,
        message: '发布物品失败，请稍后重试',
      })
    }
  },
)

// 更新物品信息（仅发布者或管理员）
router.put(
  '/:id',
  authenticateToken,
  [
    body('title')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('标题长度必须在1-100个字符之间'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('描述长度不能超过1000个字符'),
    body('location').optional().isLength({ max: 255 }).withMessage('地点长度不能超过255个字符'),
    body('contact_info')
      .optional()
      .isLength({ max: 100 })
      .withMessage('联系方式长度不能超过100个字符'),
    body('lost_date').optional().isISO8601().withMessage('日期格式不正确'),
  ],
  async (req, res) => {
    try {
      const { id } = req.params
      console.log('✏️ 更新物品请求，ID:', id, '用户:', req.user.username)

      // 验证输入
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        console.log('❌ 输入验证失败:', errors.array())
        return res.status(400).json({
          success: false,
          message: '输入验证失败',
          errors: errors.array(),
        })
      }

      // 检查物品是否存在
      const items = await query('SELECT * FROM item WHERE id = ?', [id])
      if (items.length === 0) {
        return res.status(404).json({
          success: false,
          message: '物品不存在',
        })
      }

      const item = items[0]

      // 检查权限（只有发布者或管理员可以更新）
      if (
        item.publisher_id !== req.user.id &&
        req.user.role !== 'admin' &&
        req.user.role !== 'super admin'
      ) {
        return res.status(403).json({
          success: false,
          message: '没有权限更新此物品',
        })
      }

      // 构建更新字段
      const updateFields = []
      const updateParams = []

      Object.keys(req.body).forEach((key) => {
        if (key !== 'photos' && req.body[key] !== undefined) {
          updateFields.push(`${key} = ?`)
          updateParams.push(req.body[key])
        }
      })

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: '没有提供要更新的字段',
        })
      }

      // 更新物品信息
      await query(`UPDATE item SET ${updateFields.join(', ')} WHERE id = ?`, [...updateParams, id])

      // 如果提供了新图片，更新图片
      if (req.body.photos) {
        // 删除旧图片
        await query('DELETE FROM photo WHERE item_id = ?', [id])

        // 插入新图片
        for (const photoUrl of req.body.photos) {
          await query('INSERT INTO photo (item_id, url) VALUES (?, ?)', [id, photoUrl])
        }
      }

      console.log('✅ 物品更新成功，ID:', id)

      res.json({
        success: true,
        message: '物品更新成功',
      })
    } catch (error) {
      console.error('❌ 更新物品失败:', error)
      res.status(500).json({
        success: false,
        message: '更新物品失败，请稍后重试',
      })
    }
  },
)

// 删除物品（仅发布者或管理员）
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    console.log('🗑️ 删除物品请求，ID:', id, '用户:', req.user.username)

    // 检查物品是否存在
    const items = await query('SELECT * FROM item WHERE id = ?', [id])
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: '物品不存在',
      })
    }

    const item = items[0]

    // 检查权限（只有发布者或管理员可以删除）
    if (
      item.publisher_id !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'super admin'
    ) {
      return res.status(403).json({
        success: false,
        message: '没有权限删除此物品',
      })
    }

    // 删除物品（图片会通过外键约束自动删除）
    await query('DELETE FROM item WHERE id = ?', [id])

    console.log('✅ 物品删除成功，ID:', id)

    res.json({
      success: true,
      message: '物品删除成功',
    })
  } catch (error) {
    console.error('❌ 删除物品失败:', error)
    res.status(500).json({
      success: false,
      message: '删除物品失败，请稍后重试',
    })
  }
})

// 获取用户发布的物品
router.get('/user/my-items', authenticateToken, async (req, res) => {
  try {
    console.log('👤 获取用户物品列表，用户ID:', req.user.id)

    const { page = 1, limit = 10 } = req.query
    const pageNum = parseInt(page, 10) || 1
    const limitNum = parseInt(limit, 10) || 10
    const offset = (pageNum - 1) * limitNum

    // 查询总数
    const countResult = await query('SELECT COUNT(*) as total FROM item WHERE publisher_id = ?', [
      req.user.id,
    ])
    const total = countResult[0].total

    // 查询物品列表
    const items = await query(
      `SELECT * FROM item WHERE publisher_id = ? ORDER BY posted_date DESC LIMIT ? OFFSET ?`,
      [req.user.id, limitNum, offset],
    )

    // 为每个物品获取图片
    for (let item of items) {
      const photos = await query('SELECT url FROM photo WHERE item_id = ?', [item.id])
      item.photos = photos.map((photo) => photo.url)
    }

    console.log('✅ 获取用户物品列表成功，总数:', total)

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    })
  } catch (error) {
    console.error('❌ 获取用户物品列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取用户物品列表失败',
    })
  }
})

export default router
