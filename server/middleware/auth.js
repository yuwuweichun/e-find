import jwt from 'jsonwebtoken'

export function ensureAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' })
  }
  const token = authHeader.substring(7)
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    req.user = user
    next()
  } catch (e) {
    console.error(e)
    return res.status(401).json({ error: '无效token' })
  }
}

export function isAdmin(req, res, next) {
  // 支持 regular admin/super admin
  if (req.user && (req.user.role === 'regular admin' || req.user.role === 'super admin')) {
    return next()
  }
  return res.status(403).json({ error: '无管理员权限' })
}
