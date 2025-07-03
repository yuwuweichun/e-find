import express from 'express'
import db from '../config/database.js'
import { isAdmin, ensureAuthenticated } from '../middleware/auth.js'

const router = express.Router()

// 获取所有公告
router.get('/', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM announcements ORDER BY created_at DESC')
    res.json({ success: true, data: rows })
  } catch (err) {
    res.status(500).json({ error: '获取公告失败: ' + (err.message || err) })
  }
})

// 添加公告（管理员）
router.post('/', ensureAuthenticated, isAdmin, async (req, res) => {
  const { title, content, priority, author } = req.body
  if (!title || !content || !priority || !author) {
    return res.status(400).json({ error: '参数不完整' })
  }
  try {
    const result = await db.query(
      'INSERT INTO announcements (title, content, priority, author) VALUES (?, ?, ?, ?)',
      [title, content, priority, author],
    )
    res.json({ id: result.insertId })
  } catch (err) {
    res.status(500).json({ error: '添加公告失败: ' + (err.message || err) })
  }
})

// 删除公告（管理员）
router.delete('/:id', ensureAuthenticated, isAdmin, async (req, res) => {
  const { id } = req.params
  try {
    await db.query('DELETE FROM announcements WHERE id = ?', [id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: '删除公告失败: ' + (err.message || err) })
  }
})

export default router
