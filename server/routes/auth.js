import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { query } from '../config/database.js'

const router = express.Router()

// 用户注册
router.post(
  '/register',
  [
    body('username').isLength({ min: 3, max: 50 }).withMessage('用户名长度必须在3-50个字符之间'),
    body('password').isLength({ min: 6 }).withMessage('密码长度至少6个字符'),
    body('phone').optional().isMobilePhone('zh-CN').withMessage('请输入有效的手机号码'),
    body('student_no')
      .optional()
      .isLength({ min: 1, max: 20 })
      .withMessage('学号长度必须在1-20个字符之间'),
    body('full_name')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('姓名长度必须在1-50个字符之间'),
  ],
  async (req, res) => {
    try {
      console.log('📝 用户注册请求:', req.body)

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

      const { username, password, phone, student_no, full_name } = req.body

      // 检查用户名是否已存在
      const existingUser = await query('SELECT id FROM user WHERE username = ?', [username])
      if (existingUser.length > 0) {
        console.log('❌ 用户名已存在:', username)
        return res.status(400).json({
          success: false,
          message: '用户名已存在',
        })
      }

      // 加密密码
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // 插入新用户
      const result = await query(
        'INSERT INTO user (username, password, role, phone, student_no, full_name) VALUES (?, ?, ?, ?, ?, ?)',
        [
          username,
          hashedPassword,
          'regular user',
          phone || null,
          student_no || null,
          full_name || null,
        ],
      )

      console.log('✅ 用户注册成功，用户ID:', result.insertId)

      res.status(201).json({
        success: true,
        message: '注册成功',
        data: {
          id: result.insertId,
          username,
          role: 'regular user',
        },
      })
    } catch (error) {
      console.error('❌ 注册失败:', error)
      res.status(500).json({
        success: false,
        message: '注册失败，请稍后重试',
      })
    }
  },
)

// 用户登录
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  async (req, res) => {
    try {
      console.log('🔐 用户登录请求:', { username: req.body.username })

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

      const { username, password } = req.body

      // 查找用户
      const users = await query('SELECT * FROM user WHERE username = ?', [username])
      if (users.length === 0) {
        console.log('❌ 用户不存在:', username)
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误',
        })
      }

      const user = users[0]

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        console.log('❌ 密码错误:', username)
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误',
        })
      }

      // 生成JWT令牌
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' },
      )

      console.log('✅ 用户登录成功:', username)

      res.json({
        success: true,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            phone: user.phone,
            student_no: user.student_no,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
          },
        },
      })
    } catch (error) {
      console.error('❌ 登录失败:', error)
      res.status(500).json({
        success: false,
        message: '登录失败，请稍后重试',
      })
    }
  },
)

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌',
      })
    }

    const token = authHeader.substring(7)

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')

    // 获取用户信息
    const users = await query(
      'SELECT id, username, role, phone, student_no, full_name, avatar_url FROM user WHERE id = ?',
      [decoded.id],
    )

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      })
    }

    console.log('✅ 获取用户信息成功:', decoded.username)

    res.json({
      success: true,
      data: users[0],
    })
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error)
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌',
      })
    }
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
    })
  }
})

export default router
