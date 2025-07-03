import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// 导入路由
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import itemRoutes from './routes/items.js'
import photoRoutes from './routes/photos.js'
import messagesRouter from './routes/messages.js'

// 导入中间件
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { testConnection } from './config/database.js'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 中间件配置
app.use(helmet()) // 安全头
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:9000',
    credentials: true,
  }),
) // 跨域支持
app.use(morgan('combined')) // 日志记录
app.use(express.json()) // 解析JSON请求体
app.use(express.urlencoded({ extended: true })) // 解析URL编码请求体

// 静态资源映射
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// 路由配置
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/items', itemRoutes)
app.use('/api/photos', photoRoutes)
app.use('/api/messages', messagesRouter)

// 健康检查端点
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection()
    res.json({
      status: 'OK',
      message: '服务器运行正常',
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: '服务器异常',
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'E-Find API 服务器',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      items: '/api/items',
      photos: '/api/photos',
      health: '/health',
    },
  })
})

// 错误处理中间件
app.use(notFound)
app.use(errorHandler)

// 启动服务器
app.listen(PORT, async () => {
  console.log('🚀 E-Find API 服务器启动中...')
  console.log(`📡 服务器运行在端口 ${PORT}`)
  console.log(`🔗 健康检查: http://localhost:${PORT}/health`)
  console.log(`📚 API文档: http://localhost:${PORT}/`)

  // 测试数据库连接
  try {
    const dbConnected = await testConnection()
    if (dbConnected) {
      console.log('✅ 数据库连接正常')
    } else {
      console.log('⚠️ 数据库连接失败，请检查配置')
    }
  } catch (error) {
    console.log('❌ 数据库连接测试失败:', error.message)
  }

  console.log('🎉 服务器启动完成！')
})

export default app
