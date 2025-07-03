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

export default router
