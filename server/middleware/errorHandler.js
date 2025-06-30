// 错误处理中间件
export const errorHandler = (err, req, res) => {
  console.error('❌ 服务器错误:', err)

  // 默认错误状态码
  const statusCode = err.statusCode || 500

  // 默认错误消息
  const message = err.message || '服务器内部错误'

  // 开发环境返回详细错误信息
  const error =
    process.env.NODE_ENV === 'development'
      ? {
          message,
          stack: err.stack,
          details: err,
        }
      : {
          message,
        }

  res.status(statusCode).json({
    success: false,
    error,
  })
}

// 404错误处理
export const notFound = (req, res, next) => {
  const error = new Error(`路径 ${req.originalUrl} 不存在`)
  error.statusCode = 404
  next(error)
}
