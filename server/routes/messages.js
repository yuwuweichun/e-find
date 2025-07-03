import express from 'express'
const router = express.Router()
import { query } from '../config/database.js'
import { ensureAuthenticated } from '../middleware/auth.js'

// 获取留言列表（分页，顶级留言）
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1
  const pageSize = parseInt(req.query.pageSize, 10) || 10
  const offset = (page - 1) * pageSize

  try {
    // 查询顶级留言
    const messages = await query(
      `SELECT m.id, m.user_id, u.username, u.avatar_url, m.content, m.created_at,
        (SELECT COUNT(*) FROM message_likes WHERE message_id = m.id) AS like_count,
        (SELECT COUNT(*) FROM messages WHERE parent_id = m.id) AS reply_count
       FROM messages m
       JOIN user u ON m.user_id = u.id
       WHERE m.parent_id IS NULL
       ORDER BY m.created_at DESC
       LIMIT ${Number(offset)}, ${Number(pageSize)}`,
    )

    // 查询总数
    const totalRow = await query(`SELECT COUNT(*) as total FROM messages WHERE parent_id IS NULL`)

    res.json({ messages, total: totalRow[0].total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 获取留言详情（含所有回复）
router.get('/:id', async (req, res) => {
  const id = req.params.id
  try {
    // 查询主留言
    const mainRows = await query(
      `SELECT m.id, m.user_id, u.username, u.avatar_url, m.content, m.created_at,
        (SELECT COUNT(*) FROM message_likes WHERE message_id = m.id) AS like_count
       FROM messages m
       JOIN user u ON m.user_id = u.id
       WHERE m.id = ?`,
      [id],
    )
    const message = mainRows[0]
    if (!message) return res.status(404).json({ error: '留言不存在' })

    // 查询所有回复
    const replies = await query(
      `SELECT m.id, m.user_id, u.username, u.avatar_url, m.content, m.created_at,
        (SELECT COUNT(*) FROM message_likes WHERE message_id = m.id) AS like_count
       FROM messages m
       JOIN user u ON m.user_id = u.id
       WHERE m.parent_id = ?
       ORDER BY m.created_at ASC`,
      [id],
    )

    message.replies = replies
    res.json(message)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 发布留言/回复（需登录）
router.post('/', ensureAuthenticated, async (req, res) => {
  const { content, parent_id } = req.body
  const user_id = req.user.id // 假设登录后 req.user 有用户信息
  const pid = parent_id === undefined || parent_id === null ? null : parent_id

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: '留言内容不能为空' })
  }

  try {
    const result = await query(
      `INSERT INTO messages (user_id, content, parent_id) VALUES (?, ?, ?)`,
      [user_id, content, pid],
    )
    res.json({ success: true, message: '留言成功', id: result.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 点赞留言（需登录）
router.post('/:id/like', ensureAuthenticated, async (req, res) => {
  const message_id = req.params.id
  const user_id = req.user.id

  try {
    // 防止重复点赞
    await query(`INSERT IGNORE INTO message_likes (message_id, user_id) VALUES (?, ?)`, [
      message_id,
      user_id,
    ])
    res.json({ success: true, message: '点赞成功' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 取消点赞（需登录）
router.delete('/:id/like', ensureAuthenticated, async (req, res) => {
  const message_id = req.params.id
  const user_id = req.user.id

  try {
    await query(`DELETE FROM message_likes WHERE message_id = ? AND user_id = ?`, [
      message_id,
      user_id,
    ])
    res.json({ success: true, message: '取消点赞成功' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '服务器错误' })
  }
})

export default router
