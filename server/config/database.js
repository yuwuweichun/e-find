import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// 使用64N的数据库 配置
// const dbConfig = {
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'e_find',
//   port: process.env.DB_PORT || 3306,
//   charset: 'utf8mb4',
//   timezone: '+08:00',
// }

// 使用绿皮怪的数据库 配置
const dbConfig = {
  host: '192.168.88.128',
  user: 'root',
  password: 'root',
  database: 'lost_and_found',
  port: 3306,
}


// 创建连接池
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// 测试数据库连接
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ 数据库连接成功')
    connection.release()
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message)
    return false
  }
}

// 执行查询
export const query = async (sql, params = []) => {
  try {
    console.log('🔍 执行SQL查询:', sql)
    console.log('📝 参数:', params)

    const [rows] = await pool.execute(sql, params)
    console.log('✅ 查询成功，返回行数:', Array.isArray(rows) ? rows.length : 1)

    return rows
  } catch (error) {
    console.error('❌ 查询失败:', error.message)
    throw error
  }
}

export default pool
