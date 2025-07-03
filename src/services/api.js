// API基础配置
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://your-production-api.com'
    : 'http://localhost:3000'

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
    config.headers.Authorization = `Bearer ${token}`
  }

  console.log('🌐 API请求:', url, config)

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    console.log('📡 API响应:', response.status, data)

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('❌ API请求失败:', error)
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
  getProfile: () => {
    console.log('👤 获取用户信息')
    return request('/api/users/profile')
  },

  // 更新用户信息
  updateProfile: (profileData) => {
    console.log('✏️ 更新用户信息:', profileData)
    return request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  },

  // 修改密码
  changePassword: (passwordData) => {
    console.log('🔐 修改密码')
    return request('/api/users/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    })
  },

  // 注册新用户
  register: (userData) => {
    return request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },
}

// 物品相关API
export const itemAPI = {
  // 获取物品列表
  getItems: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/api/items?${queryString}` : '/api/items'
    console.log('🔍 获取物品列表:', params)
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

  // 获取用户发布的物品
  getMyItems: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString
      ? `/api/items/user/my-items?${queryString}`
      : '/api/items/user/my-items'
    console.log('👤 获取用户物品列表:', params)
    return request(endpoint)
  },
}

// 图片相关API
export const photoAPI = {
  // 上传图片
  uploadPhoto: (file) => {
    console.log('📸 上传图片:', file.name)

    const formData = new FormData()
    formData.append('image', file)

    return request('/api/photos/upload', {
      method: 'POST',
      headers: {
        // 不设置Content-Type，让浏览器自动设置multipart/form-data
      },
      body: formData,
    })
  },

  // 删除图片
  deletePhoto: (filename) => {
    console.log('🗑️ 删除图片:', filename)
    return request(`/api/photos/${filename}`, {
      method: 'DELETE',
    })
  },

  // 获取图片列表
  getPhotos: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/api/photos?${queryString}` : '/api/photos'
    console.log('📋 获取图片列表:', params)
    return request(endpoint)
  },
}

// 留言相关API
export const messageAPI = {
  // 获取留言列表
  getMessages: (page = 1, pageSize = 10) => {
    return request(`/api/messages?page=${page}&pageSize=${pageSize}`)
  },
  // 获取留言详情
  getMessageDetail: (id) => {
    return request(`/api/messages/${id}`)
  },
  // 发布留言/回复
  postMessage: (content, parent_id = null) => {
    return request('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ content, parent_id }),
    })
  },
  // 点赞
  likeMessage: (id) => {
    return request(`/api/messages/${id}/like`, { method: 'POST' })
  },
  // 取消点赞
  unlikeMessage: (id) => {
    return request(`/api/messages/${id}/like`, { method: 'DELETE' })
  },
}

// 工具函数
export const apiUtils = {
  // 检查是否已登录
  isLoggedIn: () => {
    return !!localStorage.getItem('token')
  },

  // 获取token
  getToken: () => {
    return localStorage.getItem('token')
  },

  // 设置token
  setToken: (token) => {
    localStorage.setItem('token', token)
    console.log('💾 Token已保存')
  },

  // 清除token
  clearToken: () => {
    localStorage.removeItem('token')
    console.log('🗑️ Token已清除')
  },

  // 获取用户信息
  getUser: () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // 设置用户信息
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    console.log('💾 用户信息已保存:', user.username)
  },

  // 清除用户信息
  clearUser: () => {
    localStorage.removeItem('user')
    console.log('🗑️ 用户信息已清除')
  },

  // 登出
  logout: () => {
    apiUtils.clearToken()
    apiUtils.clearUser()
    console.log('👋 用户已登出')
  },
}

export default {
  auth: authAPI,
  user: userAPI,
  item: itemAPI,
  photo: photoAPI,
  message: messageAPI,
  utils: apiUtils,
}
