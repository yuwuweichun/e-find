import express from 'express'
const router = express.Router()
import db from '../config/database.js'

// 统计数据接口
router.get('/stats', async (req, res) => {
  try {
    // 统计物品总数
    const [[{ itemCount }]] = await db.query('SELECT COUNT(*) as itemCount FROM item')
    // 统计用户总数
    const [[{ userCount }]] = await db.query('SELECT COUNT(*) as userCount FROM user')
    // 统计已解决
    const [[{ solvedCount }]] = await db.query(
      'SELECT COUNT(*) as solvedCount FROM item WHERE status="solved"',
    )
    // 统计待处理
    const [[{ pendingCount }]] = await db.query(
      'SELECT COUNT(*) as pendingCount FROM item WHERE status="pending"',
    )

    res.json({
      itemCount,
      userCount,
      solvedCount,
      pendingCount,
    })
  } catch (err) {
    res.status(500).json({ error: '服务器错误', message: err.message })
  }
})

// 分页获取用户列表
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10
    const offset = (page - 1) * pageSize
    // 查询总数
    const [[{ userCount }]] = await db.query('SELECT COUNT(*) as userCount FROM user')
    // 查询分页数据
    const users = await db.query(
      'SELECT id, username, role, phone, student_no, full_name, avatar_url FROM user LIMIT ? OFFSET ?',
      [pageSize, offset],
    )
    res.json({ users, total: userCount })
  } catch (err) {
    res.status(500).json({ error: '服务器错误', message: err.message })
  }
})

// 修改用户角色
router.put('/users/:id/role', async (req, res) => {
  try {
    const userId = req.params.id
    const { role } = req.body
    // 这里只做简单演示，实际应校验权限
    if (!['user', 'admin', 'super admin'].includes(role)) {
      return res.status(400).json({ error: '无效的角色' })
    }
    await db.query('UPDATE user SET role = ? WHERE id = ?', [role, userId])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: '服务器错误', message: err.message })
  }
})

export default router
