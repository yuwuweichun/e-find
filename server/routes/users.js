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

// 获取用户信息
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('👤 获取用户信息，用户ID:', req.user.id)

    const users = await query(
      'SELECT id, username, role, phone, student_no, full_name, avatar_url FROM user WHERE id = ?',
      [req.user.id],
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      })
    }

    console.log('✅ 获取用户信息成功:', users[0].username)

    res.json({
      success: true,
      data: users[0],
    })
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error)
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
    })
  }
})

// 更新用户信息
router.put(
  '/profile',
  authenticateToken,
  [
    body('phone').optional().isMobilePhone('zh-CN').withMessage('请输入有效的手机号码'),
    body('student_no')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('学号长度必须在1-20个字符之间'),
    body('full_name')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('姓名长度必须在1-50个字符之间'),
    body('avatar_url').optional().isURL().withMessage('头像URL格式不正确'),
  ],
  async (req, res) => {
    try {
      console.log('✏️ 更新用户信息，用户ID:', req.user.id, '更新字段:', Object.keys(req.body))

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

      // 构建更新字段
      const updateFields = []
      const updateParams = []

      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
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

      // 更新用户信息
      await query(`UPDATE user SET ${updateFields.join(', ')} WHERE id = ?`, [
        ...updateParams,
        req.user.id,
      ])

      console.log('✅ 用户信息更新成功')

      res.json({
        success: true,
        message: '用户信息更新成功',
      })
    } catch (error) {
      console.error('❌ 更新用户信息失败:', error)
      res.status(500).json({
        success: false,
        message: '更新用户信息失败，请稍后重试',
      })
    }
  },
)

// 修改密码
router.put(
  '/password',
  authenticateToken,
  [
    body('oldPassword').notEmpty().withMessage('原密码不能为空'),
    body('newPassword').isLength({ min: 6 }).withMessage('新密码长度至少6个字符'),
  ],
  async (req, res) => {
    try {
      console.log('🔐 修改密码请求，用户ID:', req.user.id)

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

      const { oldPassword, newPassword } = req.body

      // 获取用户当前密码
      const users = await query('SELECT password FROM user WHERE id = ?', [req.user.id])
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: '用户不存在',
        })
      }

      // 验证原密码
      const bcrypt = await import('bcryptjs')
      const isOldPasswordValid = await bcrypt.compare(oldPassword, users[0].password)
      if (!isOldPasswordValid) {
        console.log('❌ 原密码错误')
        return res.status(400).json({
          success: false,
          message: '原密码错误',
        })
      }

      // 加密新密码
      const saltRounds = 10
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

      // 更新密码
      await query('UPDATE user SET password = ? WHERE id = ?', [hashedNewPassword, req.user.id])

      console.log('✅ 密码修改成功')

      res.json({
        success: true,
        message: '密码修改成功',
      })
    } catch (error) {
      console.error('❌ 修改密码失败:', error)
      res.status(500).json({
        success: false,
        message: '修改密码失败，请稍后重试',
      })
    }
  },
)

// 注册接口
router.post(
  '/register',
  [
    body('username').isLength({ min: 3, max: 50 }).withMessage('用户名长度需在3-50之间'),
    body('password').isLength({ min: 6 }).withMessage('密码长度至少6位'),
    body('phone').optional().isMobilePhone('zh-CN').withMessage('请输入有效手机号'),
    body('student_no').optional().isLength({ min: 1, max: 20 }),
    body('full_name').optional().isLength({ min: 1, max: 50 }),
    body('avatar_url').optional().isURL().withMessage('头像URL格式不正确'),
  ],
  async (req, res) => {
    // 校验输入
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, message: '输入校验失败', errors: errors.array() })
    }
    const { username, password, phone, student_no, full_name, avatar_url } = req.body
    try {
      // 检查用户名是否已存在
      const users = await query('SELECT id FROM user WHERE username = ?', [username])
      if (users.length > 0) {
        return res.status(409).json({ success: false, message: '用户名已存在' })
      }
      // 加密密码
      const bcrypt = await import('bcryptjs')
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)
      // 插入新用户
      await query(
        'INSERT INTO user (username, password, role, phone, student_no, full_name, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          username,
          hashedPassword,
          'user',
          phone || null,
          student_no || null,
          full_name || null,
          avatar_url || null,
        ],
      )
      return res.json({ success: true, message: '注册成功' })
    } catch (error) {
      console.error('注册失败:', error)
      return res.status(500).json({ success: false, message: '注册失败，请稍后重试' })
    }
  },
)

// 获取用户统计信息（只统计发布和留言数量）
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    // 发布数量
    const postsResult = await query('SELECT COUNT(*) as count FROM item WHERE publisher_id = ?', [
      userId,
    ])
    // 留言数量
    const messagesResult = await query('SELECT COUNT(*) as count FROM messages WHERE user_id = ?', [
      userId,
    ])

    res.json({
      success: true,
      data: {
        posts: postsResult[0].count,
        messages: messagesResult[0].count,
      },
    })
  } catch (error) {
    console.error('获取用户统计信息失败:', error)
    res.status(500).json({ success: false, message: '获取用户统计信息失败' })
  }
})

export default router
