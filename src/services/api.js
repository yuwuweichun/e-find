// API基础配置
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://your-production-api.com'
    : 'http://192.168.188.46:8080'

// 请求拦截器
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  // 默认配置
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // 添加认证token
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.token = token
  }

  console.log('🌐 API请求:', url, config)

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    console.log('📡 API响应:', response.status, data)

    if (!data.success) {
      throw new Error(data.message || `请求失败，错误码: ${data.code}`)
    }

    return data
  } catch (error) {
    console.error('❌ API请求失败:', error)
    console.error('请求URL:', url)
    console.error('请求参数:', config)
    throw error
  }
}

// 认证相关API
export const authAPI = {
  // 用户注册
  register: (userData) => {
    console.log('📝 用户注册:', userData)
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  // 用户登录
  login: (credentials) => {
    console.log('🔐 用户登录:', { username: credentials.username })
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  // 获取当前用户信息
  getCurrentUser: () => {
    console.log('👤 获取当前用户信息')
    return request('/api/auth/me')
  },
}

// 用户相关API
export const userAPI = {
  // 获取用户信息
  getProfile: (userId) => {
    console.log('👤 获取用户信息', userId ? `用户ID: ${userId}` : '当前用户')
    // 如果提供了userId，则获取指定用户信息，否则获取当前用户信息
    const endpoint = userId
      ? `/api/users/${userId}/profile`
      : `/api/users/${localStorage.getItem('userId')}/profile`
    return request(endpoint)
  },

  // 更新用户信息
  updateProfile: (userId, profileData) => {
    console.log('✏️ 更新用户信息:', profileData)
    return request(`/api/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  },

  // 获取用户列表（分页+条件）
  getUserList: (params = {}) => {
    console.log('📋 获取用户列表:', params)
    const queryParams = new URLSearchParams()
    if (params.keyword) queryParams.append('keyword', params.keyword)
    if (params.role) queryParams.append('role', params.role)
    if (params.status) queryParams.append('status', params.status)
    if (params.page) queryParams.append('page', params.page)
    if (params.size) queryParams.append('size', params.size)

    const queryString = queryParams.toString()
    const endpoint = queryString ? `/api/user/page?${queryString}` : '/api/user/page'
    return request(endpoint)
  },

  // 更新用户头像
  updateAvatar: (userId, file) => {
    console.log('🖼️ 更新用户头像')
    const formData = new FormData()
    formData.append('file', file)
    return request(`/api/users/${userId}/avatar`, {
      method: 'POST',
      headers: {
        // 让浏览器自动设置 multipart/form-data
      },
      body: formData,
    })
  },

  // 禁用用户
  disableUser: (userId) => {
    console.log('🚫 禁用用户, ID:', userId)
    return request(`/api/users/disable/${userId}`, {
      method: 'POST',
    })
  },

  // 启用用户
  enableUser: (userId) => {
    console.log('✅ 启用用户, ID:', userId)
    return request(`/api/users/enable/${userId}`, {
      method: 'POST',
    })
  },

  // 升级用户权限
  promoteUser: (userId) => {
    console.log('⬆️ 升级用户权限, ID:', userId)
    return request(`/api/users/${userId}/promote`, {
      method: 'PUT',
    })
  },

  // 降级用户权限
  demoteUser: (userId) => {
    console.log('⬇️ 降级用户权限, ID:', userId)
    return request(`/api/users/${userId}/demote`, {
      method: 'PUT',
    })
  },
}

// 物品相关API
export const itemAPI = {
  // 获取物品列表
  getItems: (params = {}) => {
    console.log('🔍 获取物品列表:', params)
    const queryParams = new URLSearchParams()

    // 根据接口文档添加所有可能的查询参数
    if (params.type) {
      if (Array.isArray(params.type)) {
        params.type.forEach((t) => queryParams.append('type', t))
      } else {
        queryParams.append('type', params.type)
      }
    }
    if (params.status) queryParams.append('status', params.status)
    if (params.keyword) {
      if (Array.isArray(params.keyword)) {
        params.keyword.forEach((k) => queryParams.append('keyword', k))
      } else {
        queryParams.append('keyword', params.keyword)
      }
    }
    if (params.page) queryParams.append('page', params.page)
    if (params.size) queryParams.append('size', params.size)
    if (params.date) queryParams.append('date', params.date)
    if (params.order) queryParams.append('order', params.order)
    if (params.publisherId) queryParams.append('publisherId', params.publisherId)

    const queryString = queryParams.toString()
    const endpoint = queryString ? `/api/items?${queryString}` : '/api/items'
    return request(endpoint)
  },

  // 获取单个物品详情
  getItem: (id) => {
    console.log('🔍 获取物品详情，ID:', id)
    return request(`/api/items/${id}`)
  },

  // 发布新物品
  createItem: (itemData) => {
    console.log('📝 发布物品:', itemData)
    return request('/api/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    })
  },

  // 更新物品信息
  updateItem: (id, itemData) => {
    console.log('✏️ 更新物品，ID:', id, itemData)
    return request(`/api/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    })
  },

  // 删除物品
  deleteItem: (id) => {
    console.log('🗑️ 删除物品，ID:', id)
    return request(`/api/items/${id}`, {
      method: 'DELETE',
    })
  },

  // 更新物品状态
  updateItemStatus: (itemId, status, rejectionReason = null) => {
    console.log('✏️ 更新物品状态，ID:', itemId, '状态:', status)
    const data = { status }
    if (rejectionReason) {
      data.rejectionReason = rejectionReason
    }
    return request(`/api/items/${itemId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 获取用户发布的物品
  getMyItems: (userId, params = {}) => {
    console.log('👤 获取用户物品列表:', params)
    // 添加发布者ID查询条件
    params.publisherId = userId
    return this.getItems(params)
  },
}

// 图片相关API
export const photoAPI = {
  // 上传物品图片
  uploadItemPhoto: (itemId, file) => {
    console.log('📸 上传物品图片:', file.name, '物品ID:', itemId)
    const formData = new FormData()
    formData.append('file', file)
    return request(`/api/items/${itemId}/photos`, {
      method: 'POST',
      headers: {
        // 不设置Content-Type，让浏览器自动设置multipart/form-data
      },
      body: formData,
    })
  },

  // 获取物品图片列表
  getItemPhotos: (itemId) => {
    console.log('🖼️ 获取物品图片列表, 物品ID:', itemId)
    return request(`/api/items/${itemId}/photos`)
  },

  // 删除物品所有图片
  deleteAllItemPhotos: (itemId) => {
    console.log('🗑️ 删除物品所有图片, 物品ID:', itemId)
    return request(`/api/items/${itemId}/photos`, {
      method: 'DELETE',
    })
  },
}

// 留言相关API
export const messageAPI = {
  // 获取留言列表（分页）
  getMessages: (page = 0, size = 10) => {
    console.log('💬 获取留言列表, 页码:', page, '每页大小:', size)
    return request(`/api/messages?page=${page}&size=${size}`)
  },

  // 发布留言/回复
  postMessage: (content, parentId = null) => {
    console.log('📝 发布留言/回复:', { content, parentId })
    return request('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ content, parentId }),
    })
  },

  // 获取留言回复列表
  getReplies: (messageId) => {
    console.log('💬 获取留言回复, 留言ID:', messageId)
    return request(`/api/messages/${messageId}/replies`)
  },

  // 删除留言/回复
  deleteMessage: (messageId) => {
    console.log('🗑️ 删除留言/回复, ID:', messageId)
    return request(`/api/messages/${messageId}`, {
      method: 'DELETE',
    })
  },

  // 点赞/取消点赞
  toggleLike: (messageId) => {
    console.log('👍 点赞/取消点赞, 留言ID:', messageId)
    return request(`/api/messages/${messageId}/like`, {
      method: 'POST',
    })
  },

  // 获取留言统计信息
  getMessageStats: (messageId) => {
    console.log('📊 获取留言统计, 留言ID:', messageId)
    return request(`/api/messages/${messageId}/stats`)
  },

  // 获取用户留言统计信息
  getUserMessageStats: () => {
    console.log('📊 获取用户留言统计')
    return request('/api/messages/user/stats')
  },
}

// 公告相关API
export const announcementAPI = {
  // 获取公告列表（分页条件查询）
  getAnnouncements: (params = {}) => {
    console.log('📢 获取公告列表:', params)
    const queryParams = new URLSearchParams()
    if (params.status) queryParams.append('status', params.status)
    if (params.keyword) queryParams.append('keyword', params.keyword)
    if (params.page) queryParams.append('page', params.page)
    if (params.size) queryParams.append('size', params.size)

    const queryString = queryParams.toString()
    const endpoint = queryString ? `/api/announcements?${queryString}` : '/api/announcements'
    return request(endpoint)
  },

  // 获取可见公告列表
  getVisibleAnnouncements: () => {
    console.log('📢 获取可见公告')
    return request('/api/announcements/visible')
  },

  // 发布公告
  createAnnouncement: (announcementData) => {
    console.log('📝 发布公告:', announcementData)
    return request('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    })
  },

  // 修改公告
  updateAnnouncement: (id, announcementData) => {
    console.log('✏️ 修改公告, ID:', id, announcementData)
    return request(`/api/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(announcementData),
    })
  },

  // 下线公告
  offlineAnnouncement: (id) => {
    console.log('⬇️ 下线公告, ID:', id)
    return request(`/api/announcements/${id}/offline`, {
      method: 'PUT',
    })
  },

  // 删除公告
  deleteAnnouncement: (id) => {
    console.log('🗑️ 删除公告, ID:', id)
    return request(`/api/announcements/${id}`, {
      method: 'DELETE',
    })
  },
}

// 后台管理相关API
export const adminAPI = {
  // 合并了相关功能到对应的API模块中
}

// 工具函数
export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 辅助函数 - 获取用户留言统计
export function getUserStats() {
  return messageAPI.getUserMessageStats()
}

// 辅助函数 - 获取我的物品
export function getMyItems(params = {}) {
  const userId = localStorage.getItem('userId')
  if (!userId) {
    console.error('未找到用户ID，无法获取我的物品')
    return Promise.reject('未找到用户ID')
  }
  return itemAPI.getMyItems(userId, params)
}

export default {
  auth: authAPI,
  user: userAPI,
  item: itemAPI,
  photo: photoAPI,
  message: messageAPI,
  admin: adminAPI,
  announcement: announcementAPI,
}
